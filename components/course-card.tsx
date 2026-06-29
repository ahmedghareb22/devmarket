import Image from "next/image";
import Link from "next/link";
import { Star, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CourseCardProps {
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
}

export function CourseCard({
  id,
  title,
  slug,
  thumbnail,
  price,
  level,
  averageRating,
  reviewCount,
  enrollmentCount,
  author,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-gray-200">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
              <span className="text-white text-4xl font-bold">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Level Badge */}
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              {level}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Author */}
          <p className="text-sm text-gray-600 mb-3">
            by {author.name || "Unknown"}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({reviewCount})
            </span>
          </div>

          {/* Enrollment Count */}
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
            <Users size={16} />
            <span>{enrollmentCount} students</span>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(price)}
          </div>
        </div>
      </div>
    </Link>
  );
}
