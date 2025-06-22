export enum TASK_STATUS {
  TODO = "To Do",
  IN_PROGRESS = "In Progress",
  DONE = "Done",
}

export const TASK_STATUS_META: Record<
  TASK_STATUS,
  { title: string; badgeColor: string }
> = {
  [TASK_STATUS.TODO]: { title: "To Do", badgeColor: "bg-gray-500" },
  [TASK_STATUS.IN_PROGRESS]: {
    title: "In Progress",
    badgeColor: "bg-blue-500",
  },
  [TASK_STATUS.DONE]: { title: "Done", badgeColor: "bg-green-500" },
};
