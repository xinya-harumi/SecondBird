// 吸引度计算模块
import { BIRD_SPECIES, type BirdSpeciesData, type MigrationPoint } from '@/data/birds'

export interface AttractionFactors {
  shadesMatch: number      // 兴趣标签匹配 (0-40)
  personalityMatch: number // 性格匹配 (0-30)
  speciesAffinity: number  // 物种亲和 (0-20)
  locationBonus: number    // 位置加成 (0-10)
}

export interface AttractionResult {
  score: number
  factors: AttractionFactors
  canEncounter: boolean
}

// 性格互补/相似匹配表
const PERSONALITY_AFFINITY: Record<string, string[]> = {
  '优雅': ['高贵', '浪漫', '优雅', '高雅'],
  '社交': ['活泼', '亲人', '乐观', '团结'],
  '活泼': ['社交', '灵巧', '乐观', '好奇'],
  '好奇': ['活泼', '聪明', '冒险', '自由'],
  '忠诚': ['专一', '坚毅', '忠贞', '专情'],
  '坚毅': ['忠诚', '勇敢', '坚强', '执着'],
  '团结': ['社交', '团队', '守护', '慈爱'],
  '稳重': ['庄重', '守护', '慈爱'],
  '高贵': ['优雅', '高洁', '仙气', '高雅'],
  '浪漫': ['优雅', '专一', '忠贞'],
  '专一': ['忠诚', '浪漫', '忠贞', '专情'],
  '灵巧': ['活泼', '勤劳', '聪明'],
  '勤劳': ['灵巧', '坚毅', '执着'],
  '亲人': ['社交', '乐观', '慈爱'],
  '乐观': ['活泼', '亲人', '自由'],
  '神秘': ['独立', '聪明', '神圣'],
  '独立': ['神秘', '自由', '高洁'],
  '聪明': ['好奇', '灵巧', '神秘'],
  '自由': ['冒险', '独立', '乐观'],
  '吉祥': ['庄重', '守护', '长寿', '神圣'],
  '庄重': ['吉祥', '稳重', '高雅'],
  '守护': ['慈爱', '吉祥', '团结'],
  '慈爱': ['守护', '亲人', '团结'],
  '坚韧': ['坚强', '执着', '勇敢'],
  '冒险': ['自由', '挑战', '勇敢'],
  '执着': ['坚韧', '勤劳', '专情'],
  '勇敢': ['坚强', '冒险', '挑战'],
  '坚强': ['勇敢', '坚韧', '坚毅'],
  '挑战': ['勇敢', '冒险', '团队'],
  '团队': ['挑战', '团结'],
  '神圣': ['神秘', '高洁', '吉祥'],
  '忠贞': ['忠诚', '专一', '专情'],
  '高洁': ['高贵', '神圣', '独立'],
  '长寿': ['吉祥', '高雅', '仙气'],
  '高雅': ['高贵', '优雅', '长寿', '庄重'],
  '仙气': ['高贵', '长寿', '神圣'],
  '专情': ['专一', '忠贞', '忠诚'],
}

// 物种亲和度表（某些鸟类天然更容易成为朋友）
const SPECIES_AFFINITY: Record<string, string[]> = {
  '红嘴鸥': ['天鹅', '大雁'],
  '大雁': ['天鹅', '红嘴鸥', '斑头雁'],
  '天鹅': ['大雁', '红嘴鸥', '丹顶鹤'],
  '燕子': ['杜鹃'],
  '杜鹃': ['燕子'],
  '白鹳': ['丹顶鹤', '黑颈鹤'],
  '北极燕鸥': ['红嘴鸥'],
  '斑头雁': ['大雁', '黑颈鹤'],
  '黑颈鹤': ['丹顶鹤', '白鹳', '斑头雁'],
  '丹顶鹤': ['黑颈鹤', '白鹳', '天鹅'],
}

/**
 * 计算两只鸟的吸引度
 */
export function calculateAttraction(
  bird1Shades: string[],
  bird2Shades: string[],
  bird1Personality: string[],
  bird2Personality: string[],
  bird1Species: string,
  bird2Species: string,
  distance: number
): AttractionResult {
  // 1. 计算兴趣标签匹配度 (0-40分)
  const shadesMatch = calculateShadesMatch(bird1Shades, bird2Shades)

  // 2. 计算性格匹配度 (0-30分)
  const personalityMatch = calculatePersonalityMatch(bird1Personality, bird2Personality)

  // 3. 计算物种亲和度 (0-20分)
  const speciesAffinity = calculateSpeciesAffinity(bird1Species, bird2Species)

  // 4. 计算位置加成 (0-10分)
  const locationBonus = calculateLocationBonus(distance)

  const score = shadesMatch + personalityMatch + speciesAffinity + locationBonus

  return {
    score,
    factors: {
      shadesMatch,
      personalityMatch,
      speciesAffinity,
      locationBonus,
    },
    canEncounter: distance <= 5, // 距离阈值为5度
  }
}

/**
 * 计算兴趣标签匹配度 (0-40分)
 */
function calculateShadesMatch(shades1: string[], shades2: string[]): number {
  if (shades1.length === 0 || shades2.length === 0) {
    return 10 // 默认基础分
  }

  let score = 0
  const maxScore = 40

  // 直接匹配：每个相同标签 8 分
  for (const shade1 of shades1) {
    for (const shade2 of shades2) {
      if (shade1.toLowerCase() === shade2.toLowerCase()) {
        score += 8
      } else if (
        shade1.toLowerCase().includes(shade2.toLowerCase()) ||
        shade2.toLowerCase().includes(shade1.toLowerCase())
      ) {
        // 部分匹配：4 分
        score += 4
      }
    }
  }

  return Math.min(score, maxScore)
}

/**
 * 计算性格匹配度 (0-30分)
 */
function calculatePersonalityMatch(personality1: string[], personality2: string[]): number {
  if (personality1.length === 0 || personality2.length === 0) {
    return 10 // 默认基础分
  }

  let score = 0
  const maxScore = 30

  for (const p1 of personality1) {
    // 相同性格
    if (personality2.includes(p1)) {
      score += 8
      continue
    }

    // 互补/相似性格
    const affinities = PERSONALITY_AFFINITY[p1] || []
    for (const p2 of personality2) {
      if (affinities.includes(p2)) {
        score += 5
      }
    }
  }

  return Math.min(score, maxScore)
}

/**
 * 计算物种亲和度 (0-20分)
 */
function calculateSpeciesAffinity(species1: string, species2: string): number {
  // 同物种加成
  if (species1 === species2) {
    return 15
  }

  // 检查亲和物种
  const affinities1 = SPECIES_AFFINITY[species1] || []
  const affinities2 = SPECIES_AFFINITY[species2] || []

  if (affinities1.includes(species2) || affinities2.includes(species1)) {
    return 12
  }

  // 基础分（不同物种也有基础社交可能）
  return 5
}

/**
 * 计算位置加成 (0-10分)
 */
function calculateLocationBonus(distance: number): number {
  if (distance <= 1) {
    return 10 // 非常近
  } else if (distance <= 3) {
    return 7 // 较近
  } else if (distance <= 5) {
    return 4 // 可相遇范围内
  } else {
    return 0 // 太远
  }
}

/**
 * 计算两点之间的距离（简化的欧几里得距离）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return Math.sqrt(
    Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2)
  )
}

/**
 * 判断是否达到相遇条件
 * @param score 吸引度分数
 * @returns 是否可以触发对话
 */
export function shouldTriggerConversation(score: number): boolean {
  return score >= 60
}
