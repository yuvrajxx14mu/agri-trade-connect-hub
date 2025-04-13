import { Leaf, Calendar, User, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Blog = () => {
  const categories = [
    "All Posts",
    "Farming Tips",
    "Market Insights",
    "Success Stories",
    "Industry News",
    "Technology",
  ];

  const blogPosts = [
    {
      title: "10 Essential Tips for Sustainable Farming",
      excerpt:
        "Learn the best practices for sustainable farming that can help increase your yield while protecting the environment.",
      author: "Dr. Rajesh Kumar",
      date: "March 15, 2024",
      category: "Farming Tips",
      image: "/images/sustainable-farming.jpg",
    },
    {
      title: "Understanding Agricultural Market Trends in 2024",
      excerpt:
        "A comprehensive analysis of current market trends and predictions for the agricultural sector in 2024.",
      author: "Priya Sharma",
      date: "March 12, 2024",
      category: "Market Insights",
      image: "/images/market-trends.jpg",
    },
    {
      title: "From Farm to Success: A Farmer's Journey",
      excerpt:
        "Read about how a small-scale farmer transformed their business using AgriTradeConnect's platform.",
      author: "Amit Patel",
      date: "March 10, 2024",
      category: "Success Stories",
      image: "/images/success-story.jpg",
    },
    {
      title: "The Impact of Technology on Modern Agriculture",
      excerpt:
        "Discover how technology is revolutionizing farming practices and improving efficiency in agriculture.",
      author: "Dr. Sarah Johnson",
      date: "March 8, 2024",
      category: "Technology",
      image: "/images/agri-tech.jpg",
    },
    {
      title: "Government Initiatives for Agricultural Growth",
      excerpt:
        "Learn about the latest government policies and initiatives supporting agricultural development.",
      author: "Rahul Verma",
      date: "March 5, 2024",
      category: "Industry News",
      image: "/images/government-initiatives.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">AgriTradeConnect</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Blog</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Insights, updates, and stories from the agricultural community
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All Posts" ? "default" : "outline"}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Blog Posts */}
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.title}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      {post.category}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Button variant="link" className="p-0">
                    Read More →
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            <Button variant="outline">Previous</Button>
            <Button variant="outline">1</Button>
            <Button>2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>

          {/* Newsletter */}
          <div className="mt-20 bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">
              Get the latest agricultural insights and updates delivered to your inbox
            </p>
            <div className="flex max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          © 2024 AgriTradeConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Blog; 