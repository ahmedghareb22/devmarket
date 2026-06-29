"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface SellerCourse {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  enrollmentCount: number;
  averageRating: number;
  createdAt: string;
}

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<SellerCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/seller/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
          setStats(data.stats);
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

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`/api/seller/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses(courses.filter((c) => c.id !== courseId));
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Seller Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your courses and track your earnings
          </p>
        </div>
        <Link href="/seller/courses/new">
          <Button size="lg">
            <Plus size={20} className="mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm mb-2">Total Courses</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm mb-2">Total Students</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalStudents}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm mb-2">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(stats.totalEarnings)}
          </p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-600">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>No courses yet. Create your first course to get started!</p>
            <Link href="/seller/courses/new" className="mt-4 inline-block">
              <Button>Create Course</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.enrollmentCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.averageRating.toFixed(1)} ⭐
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Link href={`/courses/${course.slug}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye size={18} />
                          </button>
                        </Link>
                        <Link href={`/seller/courses/${course.id}/edit`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
