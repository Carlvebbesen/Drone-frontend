import Image from "next/image";

export const TelloDrone = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => {
  return (
    <Image
      className={className}
      src={"/telloDrone.webp"}
      height={size}
      width={size}
      alt="tello drone"
    />
  );
};
