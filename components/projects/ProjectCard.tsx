import Image from "next/image";

interface ProjectCardProps {
  name: string;
  location: string;
  image: string;
  category: string;
}

export default function ProjectCard({
  name,
  location,
  image,
  category,
}: ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <span className="text-white text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Project
          </span>
        </div>
        <div className="absolute inset-0 border border-transparent group-hover:border-gold transition-colors duration-300 pointer-events-none" />
      </div>
      <div className="pt-4 pb-2">
        <h3 className="text-base font-medium">{name}</h3>
        <p className="text-sm text-medium-grey mt-1">{location}</p>
        <span className="text-[10px] uppercase tracking-widest text-gold mt-2 block">
          {category}
        </span>
      </div>
    </div>
  );
}
