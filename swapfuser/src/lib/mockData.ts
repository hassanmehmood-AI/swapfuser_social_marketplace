export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  online?: boolean;
  bio?: string;
  location?: string;
  followers?: number;
  following?: number;
  swaps?: number;
}

export type Condition = "New" | "Like New" | "Good" | "Fair";

export interface MockPost {
  id: string;
  author: MockUser;
  time: string;
  caption: string;
  images: string[];
  condition?: Condition;
  type: "swap" | "sell";
  price?: string;
  lookingFor?: string;
  swapCount: number;
  comments: number;
  likes: number;
}

export interface MockMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "sent" | "received";
}

export interface MockConversation {
  id: string;
  user: MockUser;
  lastMessage: string;
  unread?: boolean;
  active?: boolean;
  messages: MockMessage[];
}

export interface MockReview {
  id: string;
  reviewer: MockUser;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MockMapItem {
  id: string;
  title: string;
  price?: string;
  type: "sell" | "swap";
  location: string;
  distance: string;
  image: string;
  seller: MockUser;
  lat: number;
  lng: number;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const CURRENT_USER: MockUser = {
  id: "me",
  name: "You",
  username: "current_user",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDF067uMA2j1HFy2l_VEsr39KdkAWyDVDmeibsZAl357q3fwFZ7IqiGD61dZhcSew4U3fUjsGzkOAlvxA__obkkvRYgBvyFDv_VwDkOJoNH54s4McYwt0jmolJy4WeqSSstcW8gpGz3P5cGl2pvjf3AY1oQOj-Q1KHhU1yIdZBBEUccoeoTAkqapsQEUjb1nGCYCehKJirAK_eQw5qPeANdJ7r8W-fEeLCm0Ljf9CBmZHpfSsBovFZG9bHPSOmKek91wNsQ8LW_jUBU",
};

export const MOCK_USERS: MockUser[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    username: "sarahc",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrqmoc5-jrnUl_xn9bXA01Wko21ovv_djgXT55blrsnJgGeyiupFGwIojPCMC8GqvJJiM9xlC9VDC3mPx6tm1UbTfdssF4PynbbMRE5HRnN3tDiLbhfK6wPNAD3hjtkGOQxFBfCeG2FnWxI9grj99ZoAhHhE8fW1e2pOlR5ezyJO8BAaGfsKk-uiIHanl0lhYFieZqkzB3IRXuIu7E1eZbExSgqVlXq7fJr72PcuFoqdJBmDrsgKT9PZuCohsOitqWCJLrgW-udBz2",
    online: true,
  },
  {
    id: "u2",
    name: "Marcus Tech",
    username: "marcustech",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDeO_zRYTg8B4AUSz2YB-3UNRsZvg-5MCkxoZnhoLQ84abA1E-8X9lfRbYnjzyRLsEKWxvDtovFzBgEFq9_EnG85Ci8aXlBQccQkTy0vWeft9YCjZQu9GEkqgXNkYTq3PL9EWI4YrDzb66pnrO2elSJOwUFaG2tdGel8dNj3zVjp-TvyPX-KH-dHEH9UOCMAybla0qErM39iSSS6jwPImTWPKzzYttt-RwdvqRRWZm5VQr2tFJZMDe-c0BqDz9xBbJd60kkqHi9WzSo",
    verified: true,
  },
  {
    id: "u3",
    name: "Mia_Analog",
    username: "mia_analog",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBVmGOlZnWe82sh21uIUq1FR0ui9Go3h0m84vyatEdfRAete5ShHYVtAjv8tu-pVT581d0DgbvjYCPuXiRVD9sOV3m4Rl8kBJHlT0IRBEWHdN1qwb4dcPtYNiYtWSzIfXLdAibRNnB4l6E_kKIfwpSiCs5NTPiiSua2Z0vD7vj3jqkkmwfuOex2ssM4LjElDXnj1ZXPJhScNtG3UQ45miI4ggZGixh7bTClkHizCV_OZR-klSF2Rx6vqolPgsdaA4uakTnR_763HHlX",
  },
  {
    id: "u4",
    name: "Alex Design",
    username: "alexdesign",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrAtaJ-c0eB2QVvqLqQ0YSiDQj-vTgtYZTFmjfZ_0hWS3K1KN3A_AC1C8-KQnFwhMrHjKosH_Wgz6qcLn2K4dUNVCechoOFHFyRsqhQGCz6GzRba4sEU2KkOy3zq2X8Je94hJYzPhQiQVlXnK107xp4fmS-NDzlDuwdTS_p7brVUk45pHlzCf7",
    verified: true,
    online: true,
    bio: "Digital creator & UI enthusiast. Exploring the intersection of design and community. Let's swap ideas! 🎨✨",
    location: "Seattle, WA",
    followers: 1200,
    following: 845,
    swaps: 142,
  },
];

// ─── Posts ────────────────────────────────────────────────────────────────────

export const MOCK_POSTS: MockPost[] = [
  {
    id: "p1",
    author: MOCK_USERS[0],
    time: "2h",
    caption:
      "Looking to swap my vintage film camera (excellent condition) for a reliable road bike. Local meetups preferred! 📸🚲 #Swap #Vintage",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-AgB9grNw3_st31b9UuEOuAZTp7Vx8eHrJ7i-wycA--FsfbTPEVVSdhMDP0bIv-uaEgx68V4IUwkbdvoq-yhNO2XuV8QffZKZg8HJATVnNXpuMsNlnDZL6cfRwSGN5qlobNmUkcAARsAGGUgN3U_ALovfb6pMma6vVxWkCxaV0fHO5QbqdJTylwmLaPWwHXPfFOMUwUYhSq1lrkYvDeURh5kgHstSR2deq72ipeq9nx-CDKk8-X1y27qkIJIu8YBZFeHU-FOfXi6u",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhpvDmti4wqkOWynHFdi1wnlgvvNXzftcyA5-0UCZpQCd3CLii25Ty8mErEkNiOka7upFsjn_ix_5OAYzMOzZQJvXj-2bk4WCnqN38WPVgL-UPN1ZxNMPw4dxL3icGfWFG0vgPIvhoGuXKm6B6NXMzUkYabVMzxdMKMpxiCutoV7-9RobDUX77KfHIG5DbTpgmAslbJNguB4FCqlhN99PYu4QCRcgIyNtJZz3JQNrw4qf1GujPn5s5PmHOdl5-OcsTvZENdkPwyGmU",
    ],
    condition: "Like New",
    type: "swap",
    lookingFor: "Road Bike",
    swapCount: 24,
    comments: 8,
    likes: 112,
  },
  {
    id: "p2",
    author: MOCK_USERS[1],
    time: "4h",
    caption:
      "Finally built my dream custom mechanical keyboard. Happy to discuss the build if anyone is interested! #MechanicalKeyboards #DIY",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFdkVVdx2zcoDR-OQgpFE7wgCCVJ9OWizkNufBdhyujs_FWtAaYR8MfVpN9CIIkX0oa7TfO4WPxkg8HXv9me-nSDIRdn0oYYbj3i7WJtQ9fSKtfBCW2hSqVsY6tdOlyGSlbwmttUf4NAa6MbH1s2vZW51Jd9yotq3CGH0zzbM2e028gDWwEcSywlNrt-5cbLUMLvPPz80lbb7kqmByxAAbO4WOAemxF7wb5JnpEW0K0HfPHXy-xSkmV3UNgpBP0eI78fOjsuAe62W4",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-AgB9grNw3_st31b9UuEOuAZTp7Vx8eHrJ7i-wycA--FsfbTPEVVSdhMDP0bIv-uaEgx68V4IUwkbdvoq-yhNO2XuV8QffZKZg8HJATVnNXpuMsNlnDZL6cfRwSGN5qlobNmUkcAARsAGGUgN3U_ALovfb6pMma6vVxWkCxaV0fHO5QbqdJTylwmLaPWwHXPfFOMUwUYhSq1lrkYvDeURh5kgHstSR2deq72ipeq9nx-CDKk8-X1y27qkIJIu8YBZFeHU-FOfXi6u",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhpvDmti4wqkOWynHFdi1wnlgvvNXzftcyA5-0UCZpQCd3CLii25Ty8mErEkNiOka7upFsjn_ix_5OAYzMOzZQJvXj-2bk4WCnqN38WPVgL-UPN1ZxNMPw4dxL3icGfWFG0vgPIvhoGuXKm6B6NXMzUkYabVMzxdMKMpxiCutoV7-9RobDUX77KfHIG5DbTpgmAslbJNguB4FCqlhN99PYu4QCRcgIyNtJZz3JQNrw4qf1GujPn5s5PmHOdl5-OcsTvZENdkPwyGmU",
    ],
    condition: "New",
    type: "sell",
    price: "$320",
    swapCount: 18,
    comments: 12,
    likes: 45,
  },
  {
    id: "p3",
    author: MOCK_USERS[2],
    time: "6h",
    caption:
      "Finally got my hands on this beauty. Mint condition Canon AE-1, but I'm looking to trade it for something more compact for street photography. Any takers in the city? 📷✨",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhpvDmti4wqkOWynHFdi1wnlgvvNXzftcyA5-0UCZpQCd3CLii25Ty8mErEkNiOka7upFsjn_ix_5OAYzMOzZQJvXj-2bk4WCnqN38WPVgL-UPN1ZxNMPw4dxL3icGfWFG0vgPIvhoGuXKm6B6NXMzUkYabVMzxdMKMpxiCutoV7-9RobDUX77KfHIG5DbTpgmAslbJNguB4FCqlhN99PYu4QCRcgIyNtJZz3JQNrw4qf1GujPn5s5PmHOdl5-OcsTvZENdkPwyGmU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-AgB9grNw3_st31b9UuEOuAZTp7Vx8eHrJ7i-wycA--FsfbTPEVVSdhMDP0bIv-uaEgx68V4IUwkbdvoq-yhNO2XuV8QffZKZg8HJATVnNXpuMsNlnDZL6cfRwSGN5qlobNmUkcAARsAGGUgN3U_ALovfb6pMma6vVxWkCxaV0fHO5QbqdJTylwmLaPWwHXPfFOMUwUYhSq1lrkYvDeURh5kgHstSR2deq72ipeq9nx-CDKk8-X1y27qkIJIu8YBZFeHU-FOfXi6u",
    ],
    condition: "Good",
    type: "swap",
    lookingFor: "Compact Camera",
    swapCount: 31,
    comments: 15,
    likes: 88,
  },
  {
    id: "p4",
    author: MOCK_USERS[3],
    time: "1d",
    caption:
      "Selling my barely-used iPad Pro 11\" with Apple Pencil. Upgrading to the M4 version. Perfect condition, no scratches. Comes with original box. 🎨💻",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrAtaJ-c0eB2QVvqLqQ0YSiDQj-vTgtYZTFmjfZ_0hWS3K1KN3A_AC1C8-KQnFwhMrHjKosH_Wgz6qcLn2K4dUNVCechoOFHFyRsqhQGCz6GzRba4sEU2KkOy3zq2X8Je94hJYzPhQiQVlXnK107xp4fmS-NDzlDuwdTS_p7brVUk45pHlzCf7",
    ],
    condition: "Like New",
    type: "sell",
    price: "$680",
    swapCount: 6,
    comments: 5,
    likes: 201,
  },
];

// ─── Messages ─────────────────────────────────────────────────────────────────

export const ELENA: MockUser = {
  id: "elena",
  name: "Elena R.",
  username: "elena_r",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCyrb68Bs6_4tJl-Os40nNS6MFb2S9hibANxgrT29HCvF9nMjo-BHGIMs6l6NICAjnQ78XVTY5V2xwcFkBZCyHBcM2KiIRlTrUTWRzOFQwucLFMXGW3K-xM5U7BvWWjZ6m-7z1865g-Qa1MGm9cRjjdcViJmKKU5cxqZvgp3v6alBv6Tif-G9xahbrr_Z805uJqLQXlfLaLrXKd9eqywZuTYzG1MPD4CW68gcBLiGwSCLo6y3ss5cyQ9Cniv45ySFu1LAg9o70jJre0",
  online: true,
};

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: "c1",
    user: ELENA,
    lastMessage: "I can bring the vintage...",
    active: true,
    messages: [
      {
        id: "m1",
        senderId: "elena",
        text: "Hey! I saw you were looking for a vintage camera. Is your custom mechanical keyboard still up for trade?",
        timestamp: "10:30 AM",
        type: "received",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Hi Elena! Yes, the keyboard is still available. I built it with Holy Pandas and it's fully programmable. What vintage camera are you offering?",
        timestamp: "10:32 AM",
        type: "sent",
      },
      {
        id: "m3",
        senderId: "elena",
        text: "I have a Canon AE-1 in great condition. Comes with a 50mm f/1.8 lens and a camera bag. I can bring the vintage prints I took with it to show the quality!",
        timestamp: "10:35 AM",
        type: "received",
      },
      {
        id: "m4",
        senderId: "me",
        text: "That sounds like a solid deal! The AE-1 is a classic. Can we meet this weekend to check them out in person?",
        timestamp: "10:37 AM",
        type: "sent",
      },
      {
        id: "m5",
        senderId: "elena",
        text: "Saturday works perfectly for me. How about the coffee shop near the park at 2pm?",
        timestamp: "10:38 AM",
        type: "received",
      },
    ],
  },
  {
    id: "c2",
    user: {
      id: "marcus",
      name: "Marcus K.",
      username: "marcus_k",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAFdkVVdx2zcoDR-OQgpFE7wgCCVJ9OWizkNufBdhyujs_FWtAaYR8MfVpN9CIIkX0oa7TfO4WPxkg8HXv9me-nSDIRdn0oYYbj3i7WJtQ9fSKtfBCW2hSqVsY6tdOlyGSlbwmttUf4NAa6MbH1s2vZW51Jd9yotq3CGH0zzbM2e028gDWwEcSywlNrt-5cbLUMLvPPz80lbb7kqmByxAAbO4WOAemxF7wb5JnpEW0K0HfPHXy-xSkmV3UNgpBP0eI78fOjsuAe62W4",
    },
    lastMessage: "Is the Keychron Q1 still...",
    messages: [],
  },
  {
    id: "c3",
    user: {
      id: "sarah_t",
      name: "Sarah T.",
      username: "sarah_t",
      avatar: "",
    },
    lastMessage: "Thanks for the smooth...",
    messages: [],
  },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: "r1",
    reviewer: MOCK_USERS[0],
    rating: 5,
    comment: "Amazing swap! The item was exactly as described and Alex was super communicative. Would definitely swap again!",
    createdAt: "2 weeks ago",
  },
  {
    id: "r2",
    reviewer: MOCK_USERS[1],
    rating: 5,
    comment: "Smooth transaction. Alex was punctual and the keyboard was in perfect condition. Highly recommend.",
    createdAt: "1 month ago",
  },
  {
    id: "r3",
    reviewer: MOCK_USERS[2],
    rating: 4,
    comment: "Great experience overall. Minor delay in communication but item was exactly as described.",
    createdAt: "2 months ago",
  },
];

// ─── Map Items ────────────────────────────────────────────────────────────────

export const MOCK_MAP_ITEMS: MockMapItem[] = [
  {
    id: "mi1",
    title: "Vintage Film Camera",
    type: "swap",
    location: "Capitol Hill",
    distance: "0.4 mi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-AgB9grNw3_st31b9UuEOuAZTp7Vx8eHrJ7i-wycA--FsfbTPEVVSdhMDP0bIv-uaEgx68V4IUwkbdvoq-yhNO2XuV8QffZKZg8HJATVnNXpuMsNlnDZL6cfRwSGN5qlobNmUkcAARsAGGUgN3U_ALovfb6pMma6vVxWkCxaV0fHO5QbqdJTylwmLaPWwHXPfFOMUwUYhSq1lrkYvDeURh5kgHstSR2deq72ipeq9nx-CDKk8-X1y27qkIJIu8YBZFeHU-FOfXi6u",
    seller: MOCK_USERS[0],
    lat: 47.6230,
    lng: -122.3215,
  },
  {
    id: "mi2",
    title: "Mechanical Keyboard",
    price: "$320",
    type: "sell",
    location: "Fremont",
    distance: "1.2 mi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFdkVVdx2zcoDR-OQgpFE7wgCCVJ9OWizkNufBdhyujs_FWtAaYR8MfVpN9CIIkX0oa7TfO4WPxkg8HXv9me-nSDIRdn0oYYbj3i7WJtQ9fSKtfBCW2hSqVsY6tdOlyGSlbwmttUf4NAa6MbH1s2vZW51Jd9yotq3CGH0zzbM2e028gDWwEcSywlNrt-5cbLUMLvPPz80lbb7kqmByxAAbO4WOAemxF7wb5JnpEW0K0HfPHXy-xSkmV3UNgpBP0eI78fOjsuAe62W4",
    seller: MOCK_USERS[1],
    lat: 47.6516,
    lng: -122.3499,
  },
  {
    id: "mi3",
    title: "Canon AE-1 Camera",
    type: "swap",
    location: "Belltown",
    distance: "0.8 mi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhpvDmti4wqkOWynHFdi1wnlgvvNXzftcyA5-0UCZpQCd3CLii25Ty8mErEkNiOka7upFsjn_ix_5OAYzMOzZQJvXj-2bk4WCnqN38WPVgL-UPN1ZxNMPw4dxL3icGfWFG0vgPIvhoGuXKm6B6NXMzUkYabVMzxdMKMpxiCutoV7-9RobDUX77KfHIG5DbTpgmAslbJNguB4FCqlhN99PYu4QCRcgIyNtJZz3JQNrw4qf1GujPn5s5PmHOdl5-OcsTvZENdkPwyGmU",
    seller: MOCK_USERS[2],
    lat: 47.6149,
    lng: -122.3501,
  },
  {
    id: "mi4",
    title: "Vintage Denim Jacket",
    price: "$85",
    type: "sell",
    location: "Queen Anne",
    distance: "1.7 mi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrAtaJ-c0eB2QVvqLqQ0YSiDQj-vTgtYZTFmjfZ_0hWS3K1KN3A_AC1C8-KQnFwhMrHjKosH_Wgz6qcLn2K4dUNVCechoOFHFyRsqhQGCz6GzRba4sEU2KkOy3zq2X8Je94hJYzPhQiQVlXnK107xp4fmS-NDzlDuwdTS_p7brVUk45pHlzCf7",
    seller: MOCK_USERS[3],
    lat: 47.6372,
    lng: -122.3567,
  },
];
