import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  keywords: string[];
  content: string;
  readingTime: number;
}

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export function getAllBlogPosts(): BlogPost[] {
  const filenames = fs.readdirSync(postsDirectory);
  
  const posts = filenames
    .filter(name => name.endsWith('.mdx')) // Filter for .mdx files only
    .map((name) => {
    const filePath = path.join(postsDirectory, name);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug: name.replace(/\.mdx$/, ''),
      ...data,
      content,
      readingTime: Math.ceil(content.split(' ').length / 200),
    } as BlogPost;
  });
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const allPosts = getAllBlogPosts();
  return allPosts.find(post => post.slug === slug);
}


