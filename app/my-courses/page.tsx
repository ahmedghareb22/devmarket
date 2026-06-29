"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";

interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  level: string;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  author: {
    name: string | null;
  };
  enrollment: {
    progress: number;
    completedAt?: string;
  };
}

export default function MyCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/my-courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchCourses();
    }
  }, [session?.user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My Courses</h1>
        <p className="text-gray-600 text-lg">
          Continue learning from your purchased courses
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-6">
            You haven't purchased any courses yet
          </p>
          <Link href="/courses" className="inline-block">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Courses
            </button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            You have {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard {...course} />
                {/* Progress Bar */}
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${course.enrollment.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {course.enrollment.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
