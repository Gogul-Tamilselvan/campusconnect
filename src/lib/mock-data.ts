import { PlaceHolderImages } from "./placeholder-images";

export type PollOption = {
  id: number;
  text: string;
  votes: number;
};

export type Poll = {
  id: number;
  question: string;
  options: PollOption[];
  author: string;
  date: string;
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  read: boolean;
};

export type StudyMaterial = {
  id: number;
  title: string;
  type: string;
  size: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  status: 'Published' | 'Pending';
  image?: string;
};

export type Event = {
  id: number;
  name: string;
  date: string;
  category: string;
  description: string;
};


export const timetableData = {
    'Computer Science': {
      '1st Semester': [
        { day: 'Monday', time: '9-10 AM', subject: 'Intro to Programming', teacher: 'Dr. Alan' },
        { day: 'Tuesday', time: '10-11 AM', subject: 'Calculus I', teacher: 'Prof. Ada' },
        { day: 'Wednesday', time: '11-12 PM', subject: 'Communication Skills', teacher: 'Ms. Grace' },
      ],
      '3rd Semester': [
        { day: 'Monday', time: '10-11 AM', subject: 'Data Structures', teacher: 'Dr. Alan' },
        { day: 'Wednesday', time: '9-10 AM', subject: 'Database Systems', teacher: 'Prof. Charles' },
        { day: 'Friday', time: '1-2 PM', subject: 'Operating Systems', teacher: 'Dr. Linus' },
      ],
    },
  };
  
  export const announcements: Announcement[] = [
    { id: 1, title: 'Mid-term Exams Schedule', content: 'The mid-term examination schedule for all departments has been published. Please check the notice board.', author: 'Admin', date: '2024-10-15', read: false },
    { id: 2, title: 'Guest Lecture on AI', content: 'A guest lecture on "The Future of Artificial Intelligence" will be held on Oct 20, 2024, in the main auditorium.', author: 'Dr. Alan', date: '2024-10-12', read: true },
    { id: 3, title: 'Annual Sports Fest "Momentum"', content: 'Get ready for the annual sports fest starting from Nov 1, 2024. Registrations are now open.', author: 'Admin', date: '2024-10-10', read: true },
  ];
  
  export const studyMaterials: { [subject: string]: StudyMaterial[] } = {
    'Data Structures': [
      { id: 1, title: 'Lecture 1: Introduction to Arrays', type: 'PDF', size: '2.3 MB' },
      { id: 2, title: 'Lecture 2: Linked Lists', type: 'PDF', size: '3.1 MB' },
      { id: 3, title: 'Source Code: Implementations', type: 'ZIP', size: '850 KB' },
    ],
    'Database Systems': [
        { id: 4, title: 'Lecture 1: ER Diagrams', type: 'PDF', size: '1.8 MB' },
        { id: 5, title: 'Lecture 2: Normalization', type: 'PDF', size: '2.5 MB' },
    ]
  };
  
  export const blogPosts: BlogPost[] = [
    { id: 1, slug: 'my-first-semester-experience', title: 'My First Semester Experience', author: 'Student User', date: '2024-09-28', excerpt: 'A reflection on the challenges and triumphs of the first semester in college.', status: 'Published', image: PlaceHolderImages.find(i => i.id === 'blog-3')?.imageUrl },
    { id: 2, slug: 'getting-started-with-react', title: 'Getting Started with React', author: 'Teacher User', date: '2024-09-25', excerpt: 'A beginner-friendly guide to setting up your first React application and understanding its core concepts.', status: 'Published', image: PlaceHolderImages.find(i => i.id === 'blog-1')?.imageUrl },
    { id: 3, slug: 'the-importance-of-internships', title: 'The Importance of Internships', author: 'Admin User', date: '2024-09-22', excerpt: 'Why gaining practical experience through internships is crucial for your career.', status: 'Published', image: PlaceHolderImages.find(i => i.id === 'blog-2')?.imageUrl },
    { id: 4, slug: 'campus-hackathon-2024', title: 'Campus Hackathon 2024', author: 'Student User', date: '2024-09-20', excerpt: 'A new hackathon is coming to campus. Are you ready to build something amazing?', status: 'Pending', image: PlaceHolderImages.find(i => i.id === 'blog-4')?.imageUrl },
  ];
  
  export const attendanceRecords = [
    { date: '2024-10-14', subject: 'Data Structures', status: 'Present' },
    { date: '2024-10-12', subject: 'Database Systems', status: 'Present' },
    { date: '2024-10-10', subject: 'Data Structures', status: 'Absent' },
    { date: '2024-10-08', subject: 'Operating Systems', status: 'Present' },
  ];

  export const events: Event[] = [
    {
      id: 1,
      name: 'Innovate & Create Hackathon',
      date: '2024-11-15',
      category: 'Tech Fest',
      description: 'A 24-hour hackathon to build innovative solutions for real-world problems.'
    },
    {
      id: 2,
      name: 'Alumni Networking Dinner',
      date: '2024-11-20',
      category: 'Networking',
      description: 'An exclusive dinner event to connect with our esteemed alumni network.'
    },
    {
      id: 3,
      name: 'End of Semester Exams',
      date: '2024-12-05',
      category: 'Exams',
      description: 'The final examinations for the fall semester will commence.'
    }
  ];

  export const polls: Poll[] = [
    {
        id: 1,
        question: 'What is the best time for the extra class on Advanced Algorithms?',
        author: 'Teacher User',
        date: '2024-10-18',
        options: [
            { id: 1, text: 'Saturday, 10 AM - 12 PM', votes: 15 },
            { id: 2, text: 'Sunday, 2 PM - 4 PM', votes: 8 },
            { id: 3, text: 'Friday, 5 PM - 7 PM', votes: 12 },
        ]
    },
    {
        id: 2,
        question: 'Which topic should we cover next in the Web Dev club?',
        author: 'Teacher User',
        date: '2024-10-17',
        options: [
            { id: 1, text: 'Advanced CSS Animations', votes: 22 },
            { id: 2, text: 'GraphQL Basics', votes: 18 },
            { id: 3, text: 'WebSockets for Real-time Apps', votes: 14 },
        ]
    }
];
  
