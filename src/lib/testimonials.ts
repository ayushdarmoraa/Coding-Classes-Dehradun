export interface Testimonial {
  author: string;
  text: string;
  rating?: number;
  source?: string;
  course?: string; // Added course field
  image?: string; // Added image field for photo
  altText?: string; // Added altText for image
}

export const testimonials: Testimonial[] = [
  {
    author: "Priya Sharma",
    text: "Doon Coding Academy provided me with the best learning experience. The Full-Stack with Gen AI course was comprehensive and the instructors were very supportive. I landed a great job thanks to their training!",
    rating: 5,
    source: "Google Reviews",
    course: "Full-Stack with Gen AI",
    image: "/images/testimonials/priya_sharma.jpg",
    altText: "Priya Sharma, a student of Full-Stack with Gen AI course",
  },
  {
    author: "Rahul Singh",
    text: "I highly recommend Doon Coding Academy for Data Science. The curriculum is modern and industry-relevant, and the flexible payment plans made it accessible. Truly a game-changer for my career.",
    rating: 5,
    source: "Student Testimonial",
    course: "Data Science & AI",
    image: "/images/testimonials/rahul_singh.jpg",
    altText: "Rahul Singh, a student of Data Science & AI course",
  },
  {
    author: "Anjali Verma",
    text: "The Python course helped me upskill quickly. The practical approach and local campus were a huge plus. The instructors were always available to clarify doubts.",
    rating: 4,
    source: "LinkedIn",
    course: "Python Programming",
    image: "/images/testimonials/anjali_verma.jpg",
    altText: "Anjali Verma, a student of Python Programming course",
  },
  {
    author: "Vikram Kumar",
    text: "Joining the Java course at Doon Coding Academy was one of the best decisions I made. The concepts were explained clearly, and the hands-on projects solidified my understanding.",
    rating: 5,
    source: "Website Review",
    course: "Java Programming",
    image: "/images/testimonials/vikram_kumar.jpg",
    altText: "Vikram Kumar, a student of Java Programming course",
  },
  {
    author: "Sneha Gupta",
    text: "The academy's focus on practical skills and real-world applications is commendable. The Full-Stack course prepared me thoroughly for my developer role.",
    rating: 5,
    source: "Google Reviews",
    course: "Full-Stack Development (MERN + Gen AI)",
    image: "/images/testimonials/sneha_gupta.jpg",
    altText: "Sneha Gupta, a student of Full-Stack Development course",
  },
];


