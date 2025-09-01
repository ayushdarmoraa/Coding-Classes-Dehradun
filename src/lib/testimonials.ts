export interface Testimonial {
  author: string;
  text: string;
  rating?: number;
  source?: string;
}

export const testimonials: Testimonial[] = [
  {
    author: "Priya Sharma",
    text: "Doon Coding Academy provided me with the best learning experience. The Full-Stack with Gen AI course was comprehensive and the instructors were very supportive.",
    rating: 5,
    source: "Google Reviews",
  },
  {
    author: "Rahul Singh",
    text: "I highly recommend Doon Coding Academy for Data Science. The curriculum is modern and industry-relevant, and the flexible payment plans made it accessible.",
    rating: 5,
    source: "Student Testimonial",
  },
  {
    author: "Anjali Verma",
    text: "The Python course helped me upskill quickly. The practical approach and local campus were a huge plus.",
    rating: 4,
    source: "LinkedIn",
  },
];


