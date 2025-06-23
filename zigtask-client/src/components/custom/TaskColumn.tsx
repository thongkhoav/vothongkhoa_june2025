import { Flex, Heading } from "@chakra-ui/react";
import { useDrop } from "react-dnd";

export default function TaskColumn({
  status,
  tasks,
  onDropTask,
  children,
}: {
  status: string;
  tasks: any[];
  onDropTask: (taskId: string, newStatus: string) => void;
  children?: React.ReactNode;
}) {
  const [, dropRef] = useDrop({
    accept: "TASK",
    drop: (draggedItem: { id: string; status: string }) => {
      if (draggedItem.status !== status) {
        onDropTask(draggedItem.id, status);
      }
    },
  });

  return (
    <Flex
      direction={"column"}
      width="100%"
      ref={(node) => {
        dropRef(node);
      }}
      gap={4}
    >
      <Heading size="md" textAlign="center" width="100%">
        {status} ({tasks.length})
      </Heading>
      {children}
    </Flex>
  );
}
