import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>

      <p className="text-lg mb-4">
        Welcome to our store! We are passionate about providing high-quality products
        and excellent customer service. Our mission is to make shopping simple, 
        enjoyable, and reliable.
      </p>

      <p className="text-lg mb-6">
        Founded in 2023, our team has been working tirelessly to create a platform 
        where customers can find the best products at competitive prices. We value 
        honesty, transparency, and customer satisfaction above all else.
      </p>

      <div className="relative w-full h-64 mb-6">
        <Image
          src="/about-team.jpg" // replace with your image path
          alt="Our Team"
          fill
          className="object-cover rounded-lg shadow-md"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-3">Our Values</h2>
      <ul className="list-disc list-inside space-y-1 text-lg">
        <li>Customer-first approach</li>
        <li>High-quality products</li>
        <li>Fast and reliable shipping</li>
        <li>Transparency in all operations</li>
        <li>Continuous improvement</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p className="text-lg">
        Questions? Feedback? Reach out to us at{" "}
        <a href="mailto:support@example.com" className="text-blue-600 underline">
          support@example.com
        </a>
        .
      </p>
    </div>
  );
}
