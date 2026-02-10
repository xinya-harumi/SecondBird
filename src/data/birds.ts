// 候鸟数据 - 包含迁徙路线和习性
export interface BirdSpeciesData {
  id: string
  name: string
  englishName: string
  scientificName: string
  description: string
  habitat: string
  personality: string[] // 性格特征关键词
  migrationRoute: MigrationPoint[]
  imageEmoji: string // 用 emoji 代替图片
}

export interface MigrationPoint {
  month: number // 1-12
  location: string
  lat: number
  lng: number
  activity: string // 在该地点的活动
}

export const BIRD_SPECIES: BirdSpeciesData[] = [
  {
    id: 'red-billed-gull',
    name: '红嘴鸥',
    englishName: 'Black-headed Gull',
    scientificName: 'Chroicocephalus ridibundus',
    description: '优雅的水鸟，冬季成群飞往温暖的南方湖泊。在昆明滇池，它们是冬日最美的风景。',
    habitat: '湖泊、河流、海岸',
    personality: ['优雅', '社交', '活泼', '好奇'],
    imageEmoji: '🕊️',
    migrationRoute: [
      { month: 1, location: '云南昆明滇池', lat: 24.8, lng: 102.7, activity: '越冬休养' },
      { month: 2, location: '云南昆明滇池', lat: 24.8, lng: 102.7, activity: '越冬休养' },
      { month: 3, location: '四川成都', lat: 30.5, lng: 104.0, activity: '北迁途中' },
      { month: 4, location: '内蒙古呼伦湖', lat: 48.9, lng: 117.4, activity: '北迁途中' },
      { month: 5, location: '西伯利亚贝加尔湖', lat: 53.5, lng: 108.0, activity: '繁殖准备' },
      { month: 6, location: '西伯利亚贝加尔湖', lat: 53.5, lng: 108.0, activity: '繁殖产卵' },
      { month: 7, location: '西伯利亚贝加尔湖', lat: 53.5, lng: 108.0, activity: '育雏' },
      { month: 8, location: '西伯利亚贝加尔湖', lat: 53.5, lng: 108.0, activity: '育雏' },
      { month: 9, location: '蒙古国乌兰巴托', lat: 47.9, lng: 106.9, activity: '南迁途中' },
      { month: 10, location: '甘肃兰州', lat: 36.0, lng: 103.8, activity: '南迁途中' },
      { month: 11, location: '云南昆明滇池', lat: 24.8, lng: 102.7, activity: '抵达越冬地' },
      { month: 12, location: '云南昆明滇池', lat: 24.8, lng: 102.7, activity: '越冬休养' },
    ],
  },
  {
    id: 'swan-goose',
    name: '大雁',
    englishName: 'Swan Goose',
    scientificName: 'Anser cygnoides',
    description: '忠诚的候鸟，一生只有一个伴侣。它们排成人字形飞行，是秋天天空最动人的画面。',
    habitat: '湿地、草原、农田',
    personality: ['忠诚', '坚毅', '团结', '稳重'],
    imageEmoji: '🦆',
    migrationRoute: [
      { month: 1, location: '江西鄱阳湖', lat: 29.1, lng: 116.3, activity: '越冬' },
      { month: 2, location: '江西鄱阳湖', lat: 29.1, lng: 116.3, activity: '越冬' },
      { month: 3, location: '山东黄河三角洲', lat: 37.8, lng: 119.0, activity: '北迁途中' },
      { month: 4, location: '辽宁盘锦湿地', lat: 41.1, lng: 122.0, activity: '北迁途中' },
      { month: 5, location: '黑龙江扎龙湿地', lat: 47.2, lng: 124.3, activity: '繁殖准备' },
      { month: 6, location: '黑龙江扎龙湿地', lat: 47.2, lng: 124.3, activity: '繁殖产卵' },
      { month: 7, location: '黑龙江扎龙湿地', lat: 47.2, lng: 124.3, activity: '育雏' },
      { month: 8, location: '黑龙江扎龙湿地', lat: 47.2, lng: 124.3, activity: '育雏' },
      { month: 9, location: '吉林向海湿地', lat: 44.9, lng: 122.3, activity: '南迁途中' },
      { month: 10, location: '河北白洋淀', lat: 38.9, lng: 116.0, activity: '南迁途中' },
      { month: 11, location: '安徽巢湖', lat: 31.6, lng: 117.8, activity: '南迁途中' },
      { month: 12, location: '江西鄱阳湖', lat: 29.1, lng: 116.3, activity: '越冬' },
    ],
  },
  {
    id: 'mute-swan',
    name: '天鹅',
    englishName: 'Mute Swan',
    scientificName: 'Cygnus olor',
    description: '高贵优雅的水鸟，洁白的羽毛象征纯洁。它们是湖泊中最美丽的精灵。',
    habitat: '湖泊、河流',
    personality: ['高贵', '优雅', '浪漫', '专一'],
    imageEmoji: '🦢',
    migrationRoute: [
      { month: 1, location: '山东荣成天鹅湖', lat: 37.2, lng: 122.4, activity: '越冬' },
      { month: 2, location: '山东荣成天鹅湖', lat: 37.2, lng: 122.4, activity: '越冬' },
      { month: 3, location: '山东荣成天鹅湖', lat: 37.2, lng: 122.4, activity: '越冬' },
      { month: 4, location: '内蒙古乌梁素海', lat: 41.0, lng: 108.8, activity: '北迁途中' },
      { month: 5, location: '新疆巴音布鲁克', lat: 42.9, lng: 84.2, activity: '繁殖准备' },
      { month: 6, location: '新疆巴音布鲁克', lat: 42.9, lng: 84.2, activity: '繁殖产卵' },
      { month: 7, location: '新疆巴音布鲁克', lat: 42.9, lng: 84.2, activity: '育雏' },
      { month: 8, location: '新疆巴音布鲁克', lat: 42.9, lng: 84.2, activity: '育雏' },
      { month: 9, location: '新疆巴音布鲁克', lat: 42.9, lng: 84.2, activity: '准备南迁' },
      { month: 10, location: '甘肃张掖湿地', lat: 38.9, lng: 100.4, activity: '南迁途中' },
      { month: 11, location: '陕西三门峡', lat: 34.8, lng: 111.2, activity: '南迁途中' },
      { month: 12, location: '山东荣成天鹅湖', lat: 37.2, lng: 122.4, activity: '越冬' },
    ],
  },
  {
    id: 'barn-swallow',
    name: '燕子',
    englishName: 'Barn Swallow',
    scientificName: 'Hirundo rustica',
    description: '春天的使者，灵巧的飞行家。它们在屋檐下筑巢，与人类和谐共处。',
    habitat: '村庄、城镇、农田',
    personality: ['灵巧', '勤劳', '亲人', '乐观'],
    imageEmoji: '🐦',
    migrationRoute: [
      { month: 1, location: '东南亚马来西亚', lat: 3.1, lng: 101.7, activity: '越冬' },
      { month: 2, location: '东南亚泰国', lat: 13.7, lng: 100.5, activity: '越冬' },
      { month: 3, location: '广东广州', lat: 23.1, lng: 113.3, activity: '北迁途中' },
      { month: 4, location: '江苏南京', lat: 32.1, lng: 118.8, activity: '抵达繁殖地' },
      { month: 5, location: '江苏南京', lat: 32.1, lng: 118.8, activity: '筑巢' },
      { month: 6, location: '江苏南京', lat: 32.1, lng: 118.8, activity: '繁殖产卵' },
      { month: 7, location: '江苏南京', lat: 32.1, lng: 118.8, activity: '育雏' },
      { month: 8, location: '江苏南京', lat: 32.1, lng: 118.8, activity: '育雏' },
      { month: 9, location: '浙江杭州', lat: 30.3, lng: 120.2, activity: '南迁准备' },
      { month: 10, location: '福建福州', lat: 26.1, lng: 119.3, activity: '南迁途中' },
      { month: 11, location: '广东深圳', lat: 22.5, lng: 114.1, activity: '南迁途中' },
      { month: 12, location: '东南亚越南', lat: 10.8, lng: 106.6, activity: '越冬' },
    ],
  },
  {
    id: 'common-cuckoo',
    name: '杜鹃',
    englishName: 'Common Cuckoo',
    scientificName: 'Cuculus canorus',
    description: '神秘的森林歌手，"布谷布谷"的叫声是春天的象征。它们是长途迁徙的冠军。',
    habitat: '森林、灌木丛',
    personality: ['神秘', '独立', '聪明', '自由'],
    imageEmoji: '🐦‍⬛',
    migrationRoute: [
      { month: 1, location: '非洲刚果', lat: -4.3, lng: 15.3, activity: '越冬' },
      { month: 2, location: '非洲坦桑尼亚', lat: -6.2, lng: 35.7, activity: '越冬' },
      { month: 3, location: '印度孟买', lat: 19.1, lng: 72.9, activity: '北迁途中' },
      { month: 4, location: '云南西双版纳', lat: 22.0, lng: 100.8, activity: '北迁途中' },
      { month: 5, location: '四川成都', lat: 30.5, lng: 104.0, activity: '抵达繁殖地' },
      { month: 6, location: '四川成都', lat: 30.5, lng: 104.0, activity: '繁殖' },
      { month: 7, location: '陕西秦岭', lat: 33.9, lng: 108.9, activity: '繁殖' },
      { month: 8, location: '陕西秦岭', lat: 33.9, lng: 108.9, activity: '准备南迁' },
      { month: 9, location: '云南昆明', lat: 25.0, lng: 102.7, activity: '南迁途中' },
      { month: 10, location: '缅甸仰光', lat: 16.8, lng: 96.2, activity: '南迁途中' },
      { month: 11, location: '印度德里', lat: 28.6, lng: 77.2, activity: '南迁途中' },
      { month: 12, location: '非洲肯尼亚', lat: -1.3, lng: 36.8, activity: '越冬' },
    ],
  },
  {
    id: 'white-stork',
    name: '白鹳',
    englishName: 'White Stork',
    scientificName: 'Ciconia ciconia',
    description: '吉祥的象征，在欧洲被认为能带来好运和新生命。它们在高处筑巢，俯瞰大地。',
    habitat: '湿地、草原、村庄',
    personality: ['吉祥', '庄重', '守护', '慈爱'],
    imageEmoji: '🦩',
    migrationRoute: [
      { month: 1, location: '非洲南非', lat: -26.2, lng: 28.0, activity: '越冬' },
      { month: 2, location: '非洲坦桑尼亚', lat: -6.2, lng: 35.7, activity: '北迁准备' },
      { month: 3, location: '埃及开罗', lat: 30.0, lng: 31.2, activity: '北迁途中' },
      { month: 4, location: '土耳其伊斯坦布尔', lat: 41.0, lng: 29.0, activity: '北迁途中' },
      { month: 5, location: '德国柏林', lat: 52.5, lng: 13.4, activity: '抵达繁殖地' },
      { month: 6, location: '德国柏林', lat: 52.5, lng: 13.4, activity: '繁殖产卵' },
      { month: 7, location: '德国柏林', lat: 52.5, lng: 13.4, activity: '育雏' },
      { month: 8, location: '德国柏林', lat: 52.5, lng: 13.4, activity: '育雏' },
      { month: 9, location: '希腊雅典', lat: 37.9, lng: 23.7, activity: '南迁途中' },
      { month: 10, location: '以色列特拉维夫', lat: 32.1, lng: 34.8, activity: '南迁途中' },
      { month: 11, location: '苏丹喀土穆', lat: 15.6, lng: 32.5, activity: '南迁途中' },
      { month: 12, location: '非洲南非', lat: -26.2, lng: 28.0, activity: '越冬' },
    ],
  },
  {
    id: 'arctic-tern',
    name: '北极燕鸥',
    englishName: 'Arctic Tern',
    scientificName: 'Sterna paradisaea',
    description: '地球上迁徙距离最长的鸟类，一生飞行的距离相当于往返月球三次。',
    habitat: '海岸、岛屿',
    personality: ['坚韧', '冒险', '自由', '执着'],
    imageEmoji: '🕊️',
    migrationRoute: [
      { month: 1, location: '南极洲', lat: -77.8, lng: 166.7, activity: '越冬' },
      { month: 2, location: '南极洲', lat: -77.8, lng: 166.7, activity: '越冬' },
      { month: 3, location: '南大西洋', lat: -40.0, lng: -20.0, activity: '北迁途中' },
      { month: 4, location: '西非塞内加尔', lat: 14.7, lng: -17.5, activity: '北迁途中' },
      { month: 5, location: '冰岛雷克雅未克', lat: 64.1, lng: -21.9, activity: '抵达繁殖地' },
      { month: 6, location: '北极圈', lat: 71.0, lng: -8.0, activity: '繁殖产卵' },
      { month: 7, location: '北极圈', lat: 71.0, lng: -8.0, activity: '育雏' },
      { month: 8, location: '北极圈', lat: 71.0, lng: -8.0, activity: '育雏' },
      { month: 9, location: '挪威奥斯陆', lat: 59.9, lng: 10.7, activity: '南迁准备' },
      { month: 10, location: '葡萄牙里斯本', lat: 38.7, lng: -9.1, activity: '南迁途中' },
      { month: 11, location: '南大西洋', lat: -20.0, lng: -10.0, activity: '南迁途中' },
      { month: 12, location: '南极洲', lat: -77.8, lng: 166.7, activity: '越冬' },
    ],
  },
  {
    id: 'bar-headed-goose',
    name: '斑头雁',
    englishName: 'Bar-headed Goose',
    scientificName: 'Anser indicus',
    description: '世界上飞得最高的鸟类之一，能够飞越喜马拉雅山脉。它们是高原的勇士。',
    habitat: '高原湖泊、湿地',
    personality: ['勇敢', '坚强', '挑战', '团队'],
    imageEmoji: '🦆',
    migrationRoute: [
      { month: 1, location: '印度阿萨姆', lat: 26.1, lng: 91.7, activity: '越冬' },
      { month: 2, location: '印度阿萨姆', lat: 26.1, lng: 91.7, activity: '越冬' },
      { month: 3, location: '尼泊尔加德满都', lat: 27.7, lng: 85.3, activity: '北迁准备' },
      { month: 4, location: '西藏拉萨', lat: 29.6, lng: 91.1, activity: '飞越喜马拉雅' },
      { month: 5, location: '青海湖', lat: 36.9, lng: 100.2, activity: '抵达繁殖地' },
      { month: 6, location: '青海湖', lat: 36.9, lng: 100.2, activity: '繁殖产卵' },
      { month: 7, location: '青海湖', lat: 36.9, lng: 100.2, activity: '育雏' },
      { month: 8, location: '青海湖', lat: 36.9, lng: 100.2, activity: '育雏' },
      { month: 9, location: '青海湖', lat: 36.9, lng: 100.2, activity: '南迁准备' },
      { month: 10, location: '西藏日喀则', lat: 29.3, lng: 88.9, activity: '南迁途中' },
      { month: 11, location: '尼泊尔博卡拉', lat: 28.2, lng: 83.9, activity: '飞越喜马拉雅' },
      { month: 12, location: '印度阿萨姆', lat: 26.1, lng: 91.7, activity: '越冬' },
    ],
  },
  {
    id: 'black-necked-crane',
    name: '黑颈鹤',
    englishName: 'Black-necked Crane',
    scientificName: 'Grus nigricollis',
    description: '高原上的神鸟，藏族人民心中的吉祥象征。它们优雅地在雪山下起舞。',
    habitat: '高原湿地、草甸',
    personality: ['神圣', '优雅', '忠贞', '高洁'],
    imageEmoji: '🦩',
    migrationRoute: [
      { month: 1, location: '云南大山包', lat: 27.3, lng: 103.4, activity: '越冬' },
      { month: 2, location: '云南大山包', lat: 27.3, lng: 103.4, activity: '越冬' },
      { month: 3, location: '贵州草海', lat: 26.8, lng: 104.2, activity: '越冬' },
      { month: 4, location: '四川若尔盖', lat: 33.6, lng: 102.9, activity: '北迁途中' },
      { month: 5, location: '青海玉树', lat: 33.0, lng: 97.0, activity: '抵达繁殖地' },
      { month: 6, location: '西藏那曲', lat: 31.5, lng: 92.1, activity: '繁殖产卵' },
      { month: 7, location: '西藏那曲', lat: 31.5, lng: 92.1, activity: '育雏' },
      { month: 8, location: '西藏那曲', lat: 31.5, lng: 92.1, activity: '育雏' },
      { month: 9, location: '青海玉树', lat: 33.0, lng: 97.0, activity: '南迁准备' },
      { month: 10, location: '四川若尔盖', lat: 33.6, lng: 102.9, activity: '南迁途中' },
      { month: 11, location: '贵州草海', lat: 26.8, lng: 104.2, activity: '南迁途中' },
      { month: 12, location: '云南大山包', lat: 27.3, lng: 103.4, activity: '越冬' },
    ],
  },
  {
    id: 'red-crowned-crane',
    name: '丹顶鹤',
    englishName: 'Red-crowned Crane',
    scientificName: 'Grus japonensis',
    description: '仙鹤，长寿和吉祥的象征。它们优雅的舞姿是自然界最美的芭蕾。',
    habitat: '湿地、沼泽',
    personality: ['长寿', '高雅', '仙气', '专情'],
    imageEmoji: '🦩',
    migrationRoute: [
      { month: 1, location: '江苏盐城', lat: 33.4, lng: 120.1, activity: '越冬' },
      { month: 2, location: '江苏盐城', lat: 33.4, lng: 120.1, activity: '越冬' },
      { month: 3, location: '江苏盐城', lat: 33.4, lng: 120.1, activity: '北迁准备' },
      { month: 4, location: '辽宁盘锦', lat: 41.1, lng: 122.0, activity: '北迁途中' },
      { month: 5, location: '黑龙江扎龙', lat: 47.2, lng: 124.3, activity: '抵达繁殖地' },
      { month: 6, location: '黑龙江扎龙', lat: 47.2, lng: 124.3, activity: '繁殖产卵' },
      { month: 7, location: '黑龙江扎龙', lat: 47.2, lng: 124.3, activity: '育雏' },
      { month: 8, location: '黑龙江扎龙', lat: 47.2, lng: 124.3, activity: '育雏' },
      { month: 9, location: '黑龙江扎龙', lat: 47.2, lng: 124.3, activity: '南迁准备' },
      { month: 10, location: '吉林向海', lat: 44.9, lng: 122.3, activity: '南迁途中' },
      { month: 11, location: '山东黄河口', lat: 37.8, lng: 119.0, activity: '南迁途中' },
      { month: 12, location: '江苏盐城', lat: 33.4, lng: 120.1, activity: '越冬' },
    ],
  },
]

// 根据月份获取鸟的当前位置
export function getBirdCurrentLocation(species: BirdSpeciesData, month?: number): MigrationPoint {
  const currentMonth = month || new Date().getMonth() + 1
  return species.migrationRoute.find(p => p.month === currentMonth) || species.migrationRoute[0]
}

// 根据用户兴趣标签匹配鸟类
export function matchBirdByPersonality(userTraits: string[]): BirdSpeciesData {
  const scores = BIRD_SPECIES.map(bird => {
    const matchCount = bird.personality.filter(p =>
      userTraits.some(t => t.includes(p) || p.includes(t))
    ).length
    return { bird, score: matchCount }
  })

  scores.sort((a, b) => b.score - a.score)

  if (scores[0].score === 0) {
    return BIRD_SPECIES[Math.floor(Math.random() * BIRD_SPECIES.length)]
  }

  return scores[0].bird
}

// 检查两只鸟是否在同一地点（可以相遇）
export function canBirdsEncounter(bird1Location: MigrationPoint, bird2Location: MigrationPoint, threshold = 5): boolean {
  const distance = Math.sqrt(
    Math.pow(bird1Location.lat - bird2Location.lat, 2) +
    Math.pow(bird1Location.lng - bird2Location.lng, 2)
  )
  return distance <= threshold
}
