"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Star, Users, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  level: string;
  duration?: number;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  author: {
    id: string;
    name: string | null;
  };
  modules?: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
    }>;
  }>;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchCourse();
    }
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course?.id }),
      });

      if (response.ok) {
        router.push("/cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-gray-600">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Thumbnail */}
          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                <span className="text-white text-6xl font-bold">
                  {course.title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                {course.level}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>

            {/* Author */}
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <p className="text-gray-700 font-medium">
                  Instructor: {course.author.name}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.round(course.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {course.averageRating.toFixed(1)} ({course.reviewCount} reviews)
              </span>
              <span className="text-gray-600">
                {course.enrollmentCount} students
              </span>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Clock size={18} />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {course.duration ? `${course.duration} minutes` : "Self-paced"}
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Users size={18} />
                  <span className="text-sm">Students</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {course.enrollmentCount}
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Award size={18} />
                  <span className="text-sm">Level</span>
                </div>
                <p className="font-semibold text-gray-900">{course.level}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About this course
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Modules */}
          {course.modules && course.modules.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Course Content
              </h2>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    <ul className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="text-gray-600 text-sm ml-4"
                        >
                          • {lesson.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">
                {formatPrice(course.price)}
              </p>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full mb-3"
              size="lg"
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>

            {/* Enroll Button */}
            <Button
              variant="outline"
              className="w-full"
              size="lg"
            >
              Enroll Now
            </Button>

            {/* Course Features */}
            <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <span className="text-gray-700">Lifetime access</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span className="text-gray-700">Mobile friendly</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏆</span>
                <span className="text-gray-700">Certificate included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
