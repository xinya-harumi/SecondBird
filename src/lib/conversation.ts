// 对话引擎模块
import { prisma } from '@/lib/prisma'
import { sendChatMessage, getValidAccessToken } from '@/lib/secondme'
import type { BirdWithUser } from '@/types'

interface ConversationContext {
  location: string
  activity: string
  weather?: string
  scene?: string
}

interface MessageRecord {
  speakerBirdId: string
  content: string
  round: number
}

const MIN_ROUNDS = 3
const MAX_ROUNDS = 5  // 3-5 轮对话，保证科普内容充足

/**
 * 运行自动对话
 */
export async function runConversation(
  conversationId: string,
  bird1: BirdWithUser,
  bird2: BirdWithUser,
  context: ConversationContext
): Promise<void> {
  try {
    // 1. 更新对话状态为进行中
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'in_progress' },
    })

    const messages: MessageRecord[] = []
    let currentRound = 1

    // 2. 生成初始话题
    const initialPrompt = buildInitialPrompt(bird1, bird2, context)

    // 3. Bird1 发起对话（自动刷新 token）
    const token1 = await getValidAccessToken(bird1.user.id)
    const response1 = await sendChatMessage(
      token1,
      initialPrompt
    )

    messages.push({
      speakerBirdId: bird1.id,
      content: response1,
      round: currentRound,
    })

    await saveMessage(conversationId, bird1.id, response1, currentRound)

    // 4. 对话循环
    while (currentRound < MAX_ROUNDS) {
      currentRound++

      // Bird2 回应（自动刷新 token）
      const lastMessage = messages[messages.length - 1]
      const response2Prompt = buildResponsePrompt(bird2, bird1, lastMessage.content, context, messages)
      const token2 = await getValidAccessToken(bird2.user.id)
      const response2 = await sendChatMessage(
        token2,
        response2Prompt
      )

      messages.push({
        speakerBirdId: bird2.id,
        content: response2,
        round: currentRound,
      })

      await saveMessage(conversationId, bird2.id, response2, currentRound)

      // 检查是否应该结束对话
      if (currentRound >= MIN_ROUNDS && shouldEndConversation(response2, currentRound)) {
        break
      }

      // 如果还没结束，Bird1 继续回应
      if (currentRound < MAX_ROUNDS) {
        currentRound++
        const response1Prompt = buildResponsePrompt(bird1, bird2, response2, context, messages)
        const token1Next = await getValidAccessToken(bird1.user.id)
        const response1Next = await sendChatMessage(
          token1Next,
          response1Prompt
        )

        messages.push({
          speakerBirdId: bird1.id,
          content: response1Next,
          round: currentRound,
        })

        await saveMessage(conversationId, bird1.id, response1Next, currentRound)

        if (currentRound >= MIN_ROUNDS && shouldEndConversation(response1Next, currentRound)) {
          break
        }
      }
    }

    // 5. 计算关系变化并更新
    const relationshipDelta = calculateRelationshipDelta(messages)
    await updateRelationship(bird1.id, bird2.id, relationshipDelta)

    // 6. 生成相遇故事并更新 Encounter
    const story = generateEncounterStory(bird1, bird2, messages, context)
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (conversation) {
      await prisma.encounter.update({
        where: { id: conversation.encounterId },
        data: { story },
      })
    }

    // 7. 更新对话状态为完成
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

  } catch (error) {
    console.error('Conversation error:', error)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'failed' },
    })
    throw error
  }
}

/**
 * 构建初始对话提示词
 */
function buildInitialPrompt(
  speaker: BirdWithUser,
  listener: BirdWithUser,
  context: ConversationContext
): string {
  return `你是${speaker.name}，一只${speaker.species.name}。
当前位置：${context.location}，${context.weather || '天气晴朗'}。

你遇到了${listener.name}（${listener.species.name}）。请打招呼，并简单介绍一下这里的环境或你的迁徙经历。

要求：用第一人称，1-2句话，自然友好，融入一点科普知识。`
}

/**
 * 构建回应提示词
 */
function buildResponsePrompt(
  speaker: BirdWithUser,
  other: BirdWithUser,
  lastMessage: string,
  context: ConversationContext,
  history: MessageRecord[]
): string {
  const round = history.length + 1

  let topic = ''
  if (round === 2) {
    topic = '聊聊你的食性或栖息习惯'
  } else if (round === 3) {
    topic = '分享你的迁徙路线或飞行能力'
  } else if (round === 4) {
    topic = '介绍这个地方的自然环境特色'
  } else {
    topic = '可以道别，祝对方迁徙顺利'
  }

  return `你是${speaker.name}，一只${speaker.species.name}，在${context.location}。

对方说：「${lastMessage}」

请回应，${topic}。

要求：用第一人称，1-2句话，自然融入科普知识。`
}

/**
 * 判断是否应该结束对话
 */
function shouldEndConversation(message: string, round: number): boolean {
  // 包含告别语
  const farewellKeywords = ['再见', '拜拜', '下次见', '有缘再见', '保重', '一路顺风', '告辞']
  if (farewellKeywords.some(kw => message.includes(kw))) {
    return true
  }

  // 已经达到最小轮数，有一定概率结束
  if (round >= MIN_ROUNDS && Math.random() > 0.7) {
    return true
  }

  return false
}

/**
 * 保存消息到数据库
 */
async function saveMessage(
  conversationId: string,
  speakerBirdId: string,
  content: string,
  round: number
): Promise<void> {
  await prisma.message.create({
    data: {
      conversationId,
      speakerBirdId,
      content,
      round,
    },
  })
}

/**
 * 计算关系变化值
 */
function calculateRelationshipDelta(messages: MessageRecord[]): number {
  // 基础增加值
  let delta = 5

  // 对话轮数越多，关系增加越多
  delta += Math.min(messages.length, 5) * 2

  // 简单的情感分析（检测积极词汇）
  const positiveKeywords = ['开心', '高兴', '喜欢', '朋友', '有趣', '期待', '美好', '快乐', '幸运', '缘分']
  const messageText = messages.map(m => m.content).join(' ')

  for (const keyword of positiveKeywords) {
    if (messageText.includes(keyword)) {
      delta += 2
    }
  }

  return Math.min(delta, 25) // 单次对话最多增加25点
}

/**
 * 更新鸟类关系
 */
async function updateRelationship(
  bird1Id: string,
  bird2Id: string,
  delta: number
): Promise<void> {
  // 检查是否已有关系
  const existing = await prisma.birdRelationship.findFirst({
    where: {
      OR: [
        { birdId: bird1Id, relatedBirdId: bird2Id },
        { birdId: bird2Id, relatedBirdId: bird1Id },
      ],
    },
  })

  if (existing) {
    // 更新现有关系
    const newStrength = Math.min(existing.strength + delta, 100)
    await prisma.birdRelationship.update({
      where: { id: existing.id },
      data: { strength: newStrength },
    })
  } else {
    // 创建新关系（双向）
    await prisma.birdRelationship.createMany({
      data: [
        { birdId: bird1Id, relatedBirdId: bird2Id, type: 'friendship', strength: delta },
        { birdId: bird2Id, relatedBirdId: bird1Id, type: 'friendship', strength: delta },
      ],
    })
  }
}

/**
 * 生成相遇故事
 */
function generateEncounterStory(
  bird1: BirdWithUser,
  bird2: BirdWithUser,
  messages: MessageRecord[],
  context: ConversationContext
): string {
  const messageCount = messages.length

  // 根据对话内容生成简短的相遇故事
  const intro = `在${context.location}，${bird1.name}和${bird2.name}相遇了。`

  let middle = ''
  if (messageCount >= 5) {
    middle = '它们聊得很投机，分享了各自的旅途见闻。'
  } else if (messageCount >= 3) {
    middle = '它们互相打了招呼，交换了一些近况。'
  } else {
    middle = '它们简短地问候了对方。'
  }

  const ending = '这次偶遇让它们的友谊又加深了一些。'

  return `${intro}${middle}${ending}`
}
