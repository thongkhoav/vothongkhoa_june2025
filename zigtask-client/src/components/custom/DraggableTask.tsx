// DraggableTask.tsx
import { useDrag } from "react-dnd";
import { Flex } from "@chakra-ui/react"; // or your UI lib
import type { Task } from "@/utils/types/task.type";

type Props = {
  item: Task;
  children: React.ReactNode;
};

export default function DraggableTask({ item, children }: Props) {
  const [{ isDragging }, dragRef] = useDrag({
    type: "TASK",
    item: { id: item.id, status: item.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Flex
      direction={"row"}
      gap={"2"}
      ref={(node) => {
        dragRef(node);
      }}
      opacity={isDragging ? 0.5 : 1}
      cursor={"move"}
      bg={"white"}
      borderRadius={"md"}
      boxShadow={"sm"}
      p={2}
      _hover={{ boxShadow: "md" }}
      transition={"box-shadow 0.2s ease-in-out"}
      alignItems={"center"}
      justifyContent={"space-between"}
      width={"100%"}
      borderWidth={1}
      borderColor={"gray.400"}
      borderStyle={"solid"}
    >
      {children}
    </Flex>
  );
}
