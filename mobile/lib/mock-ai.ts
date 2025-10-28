export interface Hotel {
  id: string
  name: string
  rating: number
  pricePerNight: number
  image: string
  amenities: string[]
  location: string
}

export interface Flight {
  id: string
  airline: string
  flightNumber: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
}

export interface DailyActivity {
  day: number
  date: string
  activities: string[]
}

export interface TravelPlan {
  hotels: Hotel[]
  outboundFlights: Flight[]
  returnFlights: Flight[]
  todoList: string[]
  dailyActivities: DailyActivity[] // Added daily activities
  totalEstimate: number
}

export function generateRecommendations(
  origin: string, // Added origin parameter
  destination: string,
  startDate: string,
  endDate: string,
  travelers: number,
  budget: number,
  preferences: string,
): TravelPlan {
  // Calculate number of nights
  const start = new Date(startDate)
  const end = new Date(endDate)
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  const flightBudget = budget * 0.35 // 35% for flights
  const hotelBudget = budget * 0.5 // 50% for hotels
  const activityBudget = budget * 0.15 // 15% for activities

  // Generate hotels within budget
  const hotels: Hotel[] = [
    {
      id: "h1",
      name: `${destination} Grand Hotel`,
      rating: 4.5,
      pricePerNight: Math.floor((hotelBudget / nights / travelers) * 0.9),
      image: `/placeholder.svg?height=200&width=300&query=luxury hotel ${destination}`,
      amenities: ["Wi-Fi ฟรี", "สระว่ายน้ำ", "ฟิตเนส", "ร้านอาหาร"],
      location: `ใจกลาง${destination}`,
    },
    {
      id: "h2",
      name: `${destination} Beach Resort`,
      rating: 4.8,
      pricePerNight: Math.floor(hotelBudget / nights / travelers),
      image: `/placeholder.svg?height=200&width=300&query=beach resort ${destination}`,
      amenities: ["Wi-Fi ฟรี", "สระว่ายน้ำ", "ชายหาดส่วนตัว", "สปา", "ร้านอาหาร"],
      location: `ชายหาด${destination}`,
    },
    {
      id: "h3",
      name: `${destination} Boutique Hotel`,
      rating: 4.3,
      pricePerNight: Math.floor((hotelBudget / nights / travelers) * 0.7),
      image: `/placeholder.svg?height=200&width=300&query=boutique hotel ${destination}`,
      amenities: ["Wi-Fi ฟรี", "คาเฟ่", "ห้องสมุด"],
      location: `ย่านเก่า${destination}`,
    },
  ]

  // Generate outbound flights within budget
  const outboundFlights: Flight[] = [
    {
      id: "f1",
      airline: "Thai Airways",
      flightNumber: "TG301",
      departure: `${origin}`,
      arrival: `${destination}`,
      departureTime: "08:00",
      arrivalTime: "10:30",
      duration: "2ชม 30นาที",
      price: Math.floor((flightBudget / 2) * 0.9),
    },
    {
      id: "f2",
      airline: "Bangkok Airways",
      flightNumber: "PG201",
      departure: `${origin}`,
      arrival: `${destination}`,
      departureTime: "13:00",
      arrivalTime: "15:30",
      duration: "2ชม 30นาที",
      price: Math.floor((flightBudget / 2) * 0.8),
    },
    {
      id: "f3",
      airline: "AirAsia",
      flightNumber: "FD401",
      departure: `${origin}`,
      arrival: `${destination}`,
      departureTime: "06:00",
      arrivalTime: "08:30",
      duration: "2ชม 30นาที",
      price: Math.floor((flightBudget / 2) * 0.7),
    },
  ]

  // Generate return flights within budget
  const returnFlights: Flight[] = [
    {
      id: "f4",
      airline: "Thai Airways",
      flightNumber: "TG302",
      departure: `${destination}`,
      arrival: `${origin}`,
      departureTime: "18:00",
      arrivalTime: "20:30",
      duration: "2ชม 30นาที",
      price: Math.floor((flightBudget / 2) * 0.9),
    },
    {
      id: "f5",
      airline: "Bangkok Airways",
      flightNumber: "PG202",
      departure: `${destination}`,
      arrival: `${origin}`,
      departureTime: "16:00",
      arrivalTime: "18:30",
      duration: "2ชม 30นาที",
      price: Math.floor((flightBudget / 2) * 0.8),
    },
    {
      id: "f6",
      airline: "AirAsia",
      flightNumber: "FD402",
      departure: `${destination}`,
      arrival: `${origin}`,
      departureTime: "20:00",
      arrivalTime: "22:30",
      duration: "2ชม 30นาที",
      price: Math.floor((flightBudget / 2) * 0.7),
    },
  ]

  // Generate todo list
  const todoList = [
    `เช็คอินโรงแรมที่ ${destination}`,
    `เที่ยวชมสถานที่สำคัญใน${destination}`,
    `ลิ้มลองอาหารท้องถิ่น`,
    `ช้อปปิ้งของฝาก`,
    `ถ่ายรูปที่จุดชมวิว`,
    `ผ่อนคลายที่สปา`,
    `เช็คเอาท์และเดินทางกลับ`,
  ]

  const dailyActivities: DailyActivity[] = []

  // Create destination-specific activities
  const getActivitiesByDestination = (dest: string, dayNum: number) => {
    const destLower = dest.toLowerCase()

    // Phuket activities with tourist attractions
    if (destLower.includes("ภูเก็ต") || destLower.includes("phuket")) {
      const phuketActivities = [
        [`เช็คอินโรงแรม`, `เดินเล่นชายหาดป่าตอง - ชายหาดที่มีชื่อเสียงที่สุดของภูเก็ต`, `ทานอาหารทะเลสดที่ตลาดบางลา - ตลาดอาหารริมทะเล`],
        [
          `ชมพระอาทิตย์ขึ้นที่แหลมพรหมเทพ - จุดชมวิวทางใต้สุดของภูเก็ต`,
          `ดำน้ำดูปะการังที่เกาะราชา - เกาะที่มีปะการังสวยงาม`,
          `ช้อปปิ้งที่ห้างเซ็นทรัลภูเก็ต - ห้างสรรพสินค้าใหญ่ที่สุด`,
          `ทานอาหารค่ำที่ร้าน Baan Rim Pa - ร้านอาหารวิวทะเล`,
        ],
        [
          `ทัวร์เมืองเก่าภูเก็ต - ชมสถาปัตยกรรมชิโน-โปรตุกีส`,
          `ถ่ายรูปที่วัดฉลอง - วัดที่ใหญ่และสำคัญที่สุดในภูเก็ต`,
          `ชมวิวที่เขาแหลมสิงห์ - จุดชมวิวพระอาทิตย์ตก`,
          `ทานอาหารที่ถนนตลาดใหญ่ - ถนนคนเดินเมืองเก่า`,
        ],
        [
          `ล่องเรือชมอ่าวพังงา - ชมเกาะหินปูนและถ้ำ`,
          `เที่ยวเกาะพีพี - เกาะที่สวยงามระดับโลก`,
          `ว่ายน้ำที่อ่าวมาหยา - อ่าวที่ปรากฏในหนัง The Beach`,
          `ชมพระอาทิตย์ตกที่ชายหาดกะตะ - ชายหาดที่เงียบสงบ`,
        ],
        [
          `ผ่อนคลายที่สปา - นวดแผนไทยและสปาทรีทเมนท์`,
          `ช้อปปิ้งของฝากที่ตลาดนัดวันอาทิตย์ - ตลาดนัดท้องถิ่น`,
          `ทานอาหารค่ำที่ร้าน Mom Tri's Kitchen - ร้านอาหารหรูวิวทะเล`,
        ],
        [`เช็คเอาท์จากโรงแรม`, `แวะซื้อของฝากที่ร้าน Cashew Nut Factory - โรงงานเม็ดมะม่วงหิมพานต์`, `เดินทางสู่สนามบินภูเก็ต`],
      ]
      return phuketActivities[dayNum % phuketActivities.length]
    }

    // Chiang Mai activities with tourist attractions
    if (destLower.includes("เชียงใหม่") || destLower.includes("chiang mai")) {
      const chiangMaiActivities = [
        [`เช็คอินโรงแรม`, `เดินเที่ยวถนนนิมมาน - ถนนแฟชั่นและคาเฟ่`, `ทานข้าวซอยที่ร้านลำดวน - ร้านข้าวซอยชื่อดัง`],
        [
          `ไหว้พระที่วัดพระธาตุดอยสุเทพ - วัดบนดอยที่ศักดิ์สิทธิ์`,
          `ชมวิวเมืองเชียงใหม่จากดอยสุเทพ - จุดชมวิวสวยงาม`,
          `เที่ยวตลาดวโรรส - ตลาดท้องถิ่นเก่าแก่`,
          `ทานอาหารเหนือที่ร้านฮือนเปา - ร้านอาหารเหนือต้นตำรับ`,
        ],
        [
          `เที่ยวชมเมืองเก่าเชียงใหม่ - ชมวัดและสถาปัตยกรรมล้านนา`,
          `ถ่ายรูปที่วัดเจดีย์หลวง - วัดเก่าแก่ใจกลางเมือง`,
          `ช้อปปิ้งที่ถนนคนเดิน - ตลาดนัดวันอาทิตย์`,
          `นวดแผนไทยที่ Women's Prison Massage - นวดโดยนักโทษหญิง`,
        ],
        [
          `ทัวร์ดอยอินทนนท์ - ยอดเขาที่สูงที่สุดในประเทศไทย`,
          `เที่ยวสวนพระองค์ - สวนดอกไม้สวยงาม`,
          `ชมน้ำตกแม่กลาง - น้ำตกที่สวยงาม`,
          `ทานอาหารที่ตลาดสดจอมทอง - ตลาดท้องถิ่น`,
        ],
        [
          `เรียนทำอาหารไทยที่โรงเรียนสอนทำอาหาร - เรียนทำอาหารไทยต้นตำรับ`,
          `ช้อปปิ้งของฝากที่ตลาด Warorot - ตลาดของฝากและอาหารแห้ง`,
          `ทานอาหารค่ำที่ร้าน Dash! Restaurant - ร้านอาหารในบ้านไม้เก่า`,
        ],
        [`เช็คเอาท์จากโรงแรม`, `แวะซื้อของฝากที่ร้าน Herb Basics - ผลิตภัณฑ์สมุนไพร`, `เดินทางสู่สนามบินเชียงใหม่`],
      ]
      return chiangMaiActivities[dayNum % chiangMaiActivities.length]
    }

    // Krabi activities with tourist attractions
    if (destLower.includes("กระบี่") || destLower.includes("krabi")) {
      const krabiActivities = [
        [`เช็คอินโรงแรม`, `เดินเล่นชายหาดอ่าวนาง - ชายหาดหลักของกระบี่`, `ทานอาหารทะเลที่ร้านริมชายหาด - อาหารทะเลสด`],
        [
          `ล่องเรือชมเกาะ 4 เกาะ - ทัวร์เกาะยอดนิยม`,
          `ดำน้ำที่เกาะไก่ - เกาะที่มีปะการังสวยงาม`,
          `ว่ายน้ำที่ถ้ำพระนาง - ชายหาดในถ้ำที่สวยงาม`,
          `ชมพระอาทิตย์ตกที่ไร่เลย์ - ชายหาดที่สวยที่สุด`,
        ],
        [
          `ปีนหน้าผาที่ไร่เลย์ - กิจกรรมปีนหน้าผาระดับโลก`,
          `เที่ยวถ้ำพระนาง - ถ้ำที่มีเรื่องราวในตำนาน`,
          `ถ่ายรูปที่วิวพอยท์ไร่เลย์ - จุดชมวิวสวยงาม`,
          `ทานอาหารที่ร้าน Krua Thara - ร้านอาหารทะเลริมชายหาด`,
        ],
        [
          `ทัวร์น้ำตกร้อน - น้ำตกที่มีน้ำอุ่น`,
          `แช่น้ำแร่ที่ Crystal Pool - สระน้ำใสสีฟ้า`,
          `เที่ยวสระมรกต - สระน้ำสีเขียวมรกต`,
          `ทานอาหารที่ตลาดเมืองกระบี่ - ตลาดอาหารท้องถิ่น`,
        ],
        [
          `ผ่อนคลายที่สปา - นวดและสปาทรีทเมนท์`,
          `ช้อปปิ้งของฝากที่ Walking Street - ถนนคนเดินกระบี่`,
          `ทานอาหารค่ำที่ร้าน Lae Lay Grill - ร้านอาหารวิวทะเล`,
        ],
        [`เช็คเอาท์จากโรงแรม`, `แวะถ่ายรูปที่วัดถ้ำเสือ - วัดบนเขาที่มีวิวสวยงาม`, `เดินทางสู่สนามบินกระบี่`],
      ]
      return krabiActivities[dayNum % krabiActivities.length]
    }

    // Default activities for other destinations
    const defaultActivities = [
      [`เช็คอินโรงแรม`, `เดินเที่ยวรอบๆ ที่พัก - สำรวจย่านที่พัก`, `ทานอาหารเย็นที่ร้านอาหารท้องถิ่น - ลิ้มลองอาหารพื้นเมือง`],
      [
        `ชมพระอาทิตย์ขึ้นที่จุดชมวิว - จุดชมวิวยอดนิยม`,
        `เที่ยวชมวัดและสถานที่สำคัญ - แหล่งท่องเที่ยวหลัก`,
        `ลิ้มลองอาหารท้องถิ่นที่ตลาด - ตลาดอาหารท้องถิ่น`,
        `ช้อปปิ้งที่ร้านค้าท้องถิ่น - ซื้อของฝาก`,
      ],
      [
        `ทัวร์ชมเมือง - ชมสถานที่สำคัญในเมือง`,
        `เยี่ยมชมพิพิธภัณฑ์ท้องถิ่น - เรียนรู้ประวัติศาสตร์`,
        `ถ่ายรูปที่จุดชมวิวยอดนิยม - จุดถ่ายรูปสวยงาม`,
        `ทานอาหารค่ำที่ร้านดัง - ร้านอาหารแนะนำ`,
      ],
      [
        `ผ่อนคลายที่สปา - นวดและผ่อนคลาย`,
        `ว่ายน้ำที่สระโรงแรม - พักผ่อนที่โรงแรม`,
        `ทานอาหารกลางวันที่ร้านริมน้ำ - ร้านอาหารวิวสวย`,
        `ชมพระอาทิตย์ตก - จุดชมพระอาทิตย์ตก`,
      ],
      [
        `ช้อปปิ้งของฝากที่ตลาดท้องถิ่น - ซื้อของฝากกลับบ้าน`,
        `เที่ยวชมสวนสาธารณะ - พักผ่อนในสวนสาธารณะ`,
        `ทานอาหารเย็นพิเศษที่ร้านชื่อดัง - มื้อสุดท้ายพิเศษ`,
      ],
      [`เช็คเอาท์จากโรงแรม`, `เที่ยวชมสถานที่สุดท้าย - แวะชมก่อนกลับ`, `เดินทางไปสนามบิน`],
    ]
    return defaultActivities[dayNum % defaultActivities.length]
  }

  for (let i = 0; i <= nights; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(currentDate.getDate() + i)

    dailyActivities.push({
      day: i + 1,
      date: currentDate.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      activities: getActivitiesByDestination(destination, i),
    })
  }

  return {
    hotels,
    outboundFlights,
    returnFlights,
    todoList,
    dailyActivities, // Added daily activities to return
    totalEstimate: budget,
  }
}
