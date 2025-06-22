import useAuthStore from "@/store/useAuthStore";

export default function TaskListPage() {
  const { user } = useAuthStore();
  return (
    <div>
      TaskListPage
      <div>{`${user?.sub}; ${user?.fullName}; ${user?.email};`}</div>
    </div>
  );
}
