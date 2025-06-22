import {
  createTaskApi,
  deleteTaskApi,
  getTaskListApi,
  updateTaskApi,
} from "@/apis/task.api";
import useAuthStore from "@/store/useAuthStore";
import useAxiosPrivate from "@/utils/axios/useAxiosPrivate";
import { DateRangePicker } from "react-date-range";
import { READ_ENV, TASK_STATUS } from "@/utils/constants";
import type {
  CreateTaskDto,
  Task,
  UpdateTaskDto,
} from "@/utils/types/task.type";
import {
  Text,
  List,
  Heading,
  Flex,
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Field,
  Input,
  Box,
  Badge,
  Select,
  createListCollection,
  Popover,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { LuAsterisk, LuCalendarCheck, LuCircleAlert } from "react-icons/lu";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const statusColorMap = {
  [TASK_STATUS.TODO]: "gray",
  [TASK_STATUS.IN_PROGRESS]: "blue",
  [TASK_STATUS.DONE]: "green",
} as const;

const taskStatusCollection = createListCollection({
  items: Object.values(TASK_STATUS).map((status) => ({
    label: status as string,
    value: status as string,
  })),
});

const initialRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

export default function TaskListPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectionRange, setSelectionRange] = useState(initialRange);
  const [submitDateRange, setSubmitDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const axiosPrivate = useAxiosPrivate();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletePopoverOpenId, setDeletePopoverOpenId] = useState(null);
  const [taskStatusMap, setTaskStatusMap] = useState<Record<string, string>>(
    {}
  );
  const [statusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);

  const handleSelectDateRange = async (ranges: any) => {
    console.log("Selected date range:", ranges);
    setSelectionRange(ranges.selection);
  };

  const handleFilterByDateRange = async () => {
    const { startDate, endDate } = selectionRange;
    setSubmitDateRange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    try {
      const data = await getTaskListApi(
        axiosPrivate,
        statusFilter,
        searchQuery,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setTasks(data);
      setIsDateRangePickerOpen(false);
    } catch (error) {
      console.error("Failed to filter tasks by date range:", error);
      toast.error("Failed to filter tasks by date range. Please try again.");
    }
  };

  useEffect(() => {
    // filter tasks based on their status
    const todo = tasks.filter((task) => task.status === TASK_STATUS.TODO);
    const inProgress = tasks.filter(
      (task) => task.status === TASK_STATUS.IN_PROGRESS
    );
    const done = tasks.filter((task) => task.status === TASK_STATUS.DONE);

    setTodoTasks(todo);
    setInProgressTasks(inProgress);
    setDoneTasks(done);
  }, [tasks]);

  const navigate = useNavigate();

  const {
    register,
    setValue,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
    control,
  } = useForm<CreateTaskDto>();

  const fetchTasks = async () => {
    try {
      console.log("Fetching tasks with status filter:", statusFilter);
      if (statusFilter !== "ALL") {
        // If a specific status is selected, fetch tasks with that status
        const data = await getTaskListApi(axiosPrivate, statusFilter);
        setTasks(data);
      } else {
        // If "All" is selected, fetch all tasks
        const data = await getTaskListApi(axiosPrivate);
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to fetch tasks. Please try again.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  // const onFilterTasks = async (status: string) => {
  //   // console.log("Filtering tasks by status:", status);
  //   setStatusFilter(status);
  //   // await fetchTasks(); // Re-fetch tasks with the selected status filter
  // };

  const onUpdateTaskStatus = async (task: Task, taskStatus: string) => {
    console.log("Updating task status:", task, taskStatus);
    try {
      const data: UpdateTaskDto = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: taskStatus as TASK_STATUS,
      };

      if (task?.id) {
        await updateTaskApi(axiosPrivate, task.id, data);
        toast.success("Task updated successfully!");
        // Update the local state with the new status
        setTasks((prevTasks: Task[]) =>
          prevTasks.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: taskStatus as TASK_STATUS,
                }
              : t
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update task status. Please try again.");
      console.error("Update task status error:", error);
    }
  };

  const onSaveTask = handleSubmit(async (data) => {
    try {
      console.log(data);
      if (updatingTaskId) {
        await updateTaskApi(axiosPrivate, updatingTaskId, data);
        toast.success("Task updated successfully!");
      } else {
        await createTaskApi(axiosPrivate, data);
        toast.success("Task created successfully!");
      }
      // Clear the form fields
      resetForm();
      setDialogOpen(false);

      fetchTasks(); // Refresh the task list after saving
    } catch (error) {
      toast.error("Failed to save task. Please try again.");
      console.error("save task error:", error);
    }
  });

  const onDeleteTask = async (taskId: string) => {
    try {
      // console.log(data);
      if (taskId) {
        await deleteTaskApi(axiosPrivate, taskId);
        toast.success("Task deleted successfully!");
      }

      fetchTasks(); // Refresh the task list after deletion
    } catch (error) {
      toast.error("Failed to delete task. Please try again.");
      console.error("Registration error:", error);
    }
  };

  const onOpenUpdateDialog = (task: Task) => {
    if (task) {
      setValue("title", task.title);
      setValue("description", task.description);
      setValue("dueDate", new Date(task.dueDate));
      setValue("status", task.status);
      setUpdatingTaskId(task.id);
      setDialogOpen(true);
    }
  };

  const onLogout = async () => {
    try {
      // Call your logout API or perform logout logic here
      // For example, you might want to clear the user session or token
      // await logoutUserApi(axiosPrivate);
      useAuthStore.getState().logout();
      Cookies.remove(READ_ENV.COOKIE_AUTH);
      toast.success("Logged out successfully!");
      // Redirect to login page or home page after logout
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const onSearchTasks = async () => {
    try {
      const data = await getTaskListApi(
        axiosPrivate,
        statusFilter,
        searchQuery,
        submitDateRange.startDate,
        submitDateRange.endDate
      );
      setTasks(data);
    } catch (error) {
      console.error("Search tasks error:", error);
      toast.error("Failed to search tasks. Please try again.");
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <Flex
        width={"100%"}
        alignItems={"center"}
        direction={"column"}
        gap="4"
        padding="4"
      >
        <Flex
          maxWidth={"800px"}
          width={"100%"}
          direction={"row"}
          gap="4"
          justifyContent="space-between"
          padding="4"
          boxShadow={"md"}
          borderRadius="md"
        >
          <Flex gap="4" flexDirection="column">
            <Text textStyle="2xl" fontWeight="bold">
              {user?.fullName}
            </Text>
            <Text textStyle="md">{user?.email}</Text>
          </Flex>
          <Button size="sm" backgroundColor="red.400" onClick={onLogout}>
            Logout
          </Button>
        </Flex>
        <Flex
          gap="4"
          width="100%"
          maxWidth={"800px"}
          justifyContent="space-between"
        >
          <Heading textAlign="center" size={"3xl"} fontWeight={"bold"}>
            Task list
          </Heading>
          <Dialog.Root
            open={isDialogOpen}
            onOpenChange={(state) => setDialogOpen(state.open)}
            placement={"center"}
            motionPreset="slide-in-bottom"
          >
            <Dialog.Trigger asChild>
              <Button
                size="sm"
                backgroundColor="blue.400"
                onClick={() => setDialogOpen(true)}
              >
                Add New Task
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content backgroundColor={"white"}>
                  <Dialog.Header>
                    <Dialog.Title>
                      {updatingTaskId ? "Update task" : "Create Task"}
                    </Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap="4">
                      <Field.Root invalid={!!errors.title}>
                        <Field.Label>
                          Title
                          <LuAsterisk color="red" />
                        </Field.Label>
                        <Input
                          {...register("title", {
                            required: "Title is required",
                          })}
                        />
                        <Field.ErrorText>
                          {errors.title?.message}
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root invalid={!!errors.description}>
                        <Field.Label>
                          Description <LuAsterisk color="red" />
                        </Field.Label>
                        <Input
                          {...register("description", {
                            required: "Description is required",
                          })}
                        />
                        <Field.ErrorText>
                          {errors.description?.message}
                        </Field.ErrorText>
                      </Field.Root>

                      <Field.Root invalid={!!errors.dueDate}>
                        <Field.Label>
                          Due date <LuAsterisk color="red" />
                        </Field.Label>
                        <Controller
                          name="dueDate"
                          control={control}
                          rules={{
                            required: "Due date is required",
                            validate: (value) =>
                              value < new Date()
                                ? "Date must be today or later"
                                : true,
                          }}
                          render={({ field }) => (
                            <Box
                              style={{
                                borderWidth: "1px",
                                borderColor: "black",
                                borderRadius: "4px",
                                width: "100%",
                                padding: "4px",
                              }}
                            >
                              <DatePicker
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date()}
                                className="w-full border h-8 px-2 rounded focus:outline-none focus:ring-0 focus:border-black"
                                placeholderText="Select a due date"
                              />
                            </Box>
                          )}
                        />
                        <Field.ErrorText>
                          {errors.dueDate?.message}
                        </Field.ErrorText>
                      </Field.Root>

                      {updatingTaskId && (
                        <Field.Root invalid={!!errors.status}>
                          <Controller
                            name="status"
                            control={control}
                            rules={{
                              required: "Status is required",
                            }}
                            render={({ field }) => (
                              <Select.Root
                                zIndex={3000}
                                collection={taskStatusCollection}
                                size="sm"
                                width="100%"
                                value={[field.value as string]}
                                onValueChange={field.onChange}
                              >
                                <Select.HiddenSelect />
                                <Select.Control>
                                  <Select.Trigger>
                                    <Select.ValueText
                                      placeholder="Select status"
                                      defaultValue={field.value}
                                    />
                                  </Select.Trigger>
                                  <Select.IndicatorGroup>
                                    <Select.Indicator />
                                  </Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                  <Select.Positioner
                                    zIndex={4000}
                                    backgroundColor={"white"}
                                    borderRadius="md"
                                    boxShadow="md"
                                    style={{ zIndex: " 4000 !important " }}
                                  >
                                    <Select.Content>
                                      {taskStatusCollection.items.map(
                                        (framework) => (
                                          <Select.Item
                                            item={framework}
                                            key={framework.value}
                                            onClick={() =>
                                              field.onChange(framework.value)
                                            }
                                          >
                                            {framework.label}
                                            <Select.ItemIndicator />
                                          </Select.Item>
                                        )
                                      )}
                                    </Select.Content>
                                  </Select.Positioner>
                                </Portal>
                              </Select.Root>
                            )}
                          />
                          <Field.ErrorText>
                            {errors.status?.message}
                          </Field.ErrorText>
                        </Field.Root>
                      )}
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button
                        variant="outline"
                        borderColor={"red.500"}
                        color={"red.500"}
                        backgroundColor={"white"}
                      >
                        Cancel
                      </Button>
                    </Dialog.ActionTrigger>
                    <Button backgroundColor={"teal.500"} onClick={onSaveTask}>
                      Save
                    </Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Flex>
        <Flex gap="2" alignItems="center" maxWidth={"800px"} width="100%">
          <Input
            placeholder="Search by title or description"
            onChange={(e) => {
              const searchValue = e.target.value;
              setSearchQuery(searchValue);
            }}
          />
          <Button size="sm" backgroundColor="blue.400" onClick={onSearchTasks}>
            Search
          </Button>
        </Flex>
        <Button
          size="sm"
          backgroundColor="blue.400"
          onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
        >
          {isDateRangePickerOpen
            ? "Hide Date Range Picker"
            : "Show Date Range Picker"}
        </Button>
        {isDateRangePickerOpen && (
          <Box
            position="absolute"
            top="60px"
            left="50%"
            transform="translateX(-50%)"
            zIndex={1000}
            backgroundColor="white"
            padding="4"
            boxShadow="md"
            borderRadius="md"
          >
            <DateRangePicker
              ranges={[selectionRange]}
              onChange={handleSelectDateRange}
              rangeColors={["#3182ce"]}
              moveRangeOnFirstSelection={false}
              months={2}
              direction="horizontal"
            />
            <Button size="sm" marginTop="2" onClick={handleFilterByDateRange}>
              Filter
            </Button>
          </Box>
        )}

        {/* <Flex gap="2" alignItems="center" justifyContent={"flex-end"}>
          <Text textStyle="md">Filter by status:</Text>
          <select
            value={statusFilter}
            onChange={(e) => onFilterTasks(e.target.value)}
            className="border border-gray-300 rounded-md p-1"
          >
            <option value="ALL">All</option>
            {Object.entries(TASK_STATUS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </Flex> */}
        <Flex gap="2" alignItems="center">
          <Text textStyle="md">Total tasks: {tasks.length}</Text>
        </Flex>
        {tasks.length > 0 ? (
          <Flex direction={"row"} gap="4">
            {Object.entries(TASK_STATUS).map(([key, value]) => {
              let listdata: Task[] = [];
              switch (value) {
                case TASK_STATUS.TODO:
                  listdata = todoTasks;
                  break;
                case TASK_STATUS.IN_PROGRESS:
                  listdata = inProgressTasks;
                  break;
                case TASK_STATUS.DONE:
                  listdata = doneTasks;
                  break;
                default:
                  listdata = tasks;
              }
              if (listdata.length === 0) {
                return (
                  <Flex key={key} height="200px" justifyContent="center">
                    <Text textStyle="md" color="gray.500">
                      No tasks in {value}. Please create a new task.
                    </Text>
                  </Flex>
                );
              }
              return (
                <List.Root gap="2" variant="plain" align="center">
                  {listdata?.map((item) => (
                    <List.Item
                      paddingBottom="2"
                      key={item.id}
                      borderBottom="1px solid #e2e8f0"
                    >
                      <Flex direction="row" gap="1" width={"100%"}>
                        <Flex direction="column" gap="1" width={"100%"}>
                          <Flex direction="column" gap="2">
                            <Flex gap="2" alignItems="center">
                              <Text textStyle="md" fontWeight="bold">
                                {item.title}
                              </Text>
                              <Badge
                                colorPalette={statusColorMap[item.status]}
                                size="sm"
                                height="fit-content"
                                padding="2px 8px"
                              >
                                {item.status}
                              </Badge>
                              <Box
                                shadow={"sm"}
                                padding="2px 4px"
                                borderRadius="md"
                              >
                                <select
                                  style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "2px 4px",
                                    marginRight: "8px",
                                  }}
                                  name="status"
                                  id="status"
                                  value={taskStatusMap[item.id] ?? item.status}
                                  onChange={(e) =>
                                    setTaskStatusMap((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                >
                                  {Object.values(TASK_STATUS).map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size={"xs"}
                                  color={"grey.500"}
                                  variant="outline"
                                  onClick={() =>
                                    onUpdateTaskStatus(
                                      item,
                                      taskStatusMap[item.id] ?? item.status
                                    )
                                  }
                                >
                                  Save Status
                                </Button>
                              </Box>
                            </Flex>
                            <Flex gap="2" alignItems="center">
                              <LuCalendarCheck size={18} color="teal" />
                              <Text textStyle="sm" color="gray.600">
                                Due:{" "}
                                {new Date(item.dueDate).toLocaleDateString()}
                              </Text>
                            </Flex>
                          </Flex>
                          <Text textStyle="md" fontWeight="normal">
                            {item.description}
                          </Text>
                        </Flex>
                        <Flex
                          direction="column"
                          justifyContent="space-between"
                          gap="2"
                        >
                          <Button
                            size="xs"
                            backgroundColor="gray.400"
                            onClick={() => onOpenUpdateDialog(item)}
                          >
                            Update
                          </Button>
                          <Popover.Root
                            open={deletePopoverOpenId === item.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setDeletePopoverOpenId(null);
                              }
                            }}
                          >
                            <Popover.Trigger asChild>
                              <Button
                                size="xs"
                                backgroundColor="red.400"
                                onClick={() => setDeletePopoverOpenId(item.id)}
                              >
                                Delete
                              </Button>
                            </Popover.Trigger>
                            <Portal>
                              <Popover.Positioner>
                                <Popover.Content>
                                  <Popover.Arrow />
                                  <Popover.Body>
                                    <Popover.Title fontWeight="medium">
                                      <Flex gap="2" alignItems={"center"}>
                                        <LuCircleAlert color="red" size={16} />
                                        <Text>Delete Task "{item.title}"</Text>
                                      </Flex>
                                    </Popover.Title>
                                    <Text my="4">
                                      Are you sure you want to delete this task?
                                    </Text>
                                    <Flex
                                      gap="2"
                                      direction="row"
                                      justifyContent={"flex-end"}
                                    >
                                      <Button
                                        size="xs"
                                        backgroundColor="gray.500"
                                        onClick={() => onDeleteTask(item.id)}
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        size="xs"
                                        backgroundColor="red.500"
                                        onClick={() =>
                                          setDeletePopoverOpenId(null)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                    </Flex>
                                  </Popover.Body>
                                </Popover.Content>
                              </Popover.Positioner>
                            </Portal>
                          </Popover.Root>
                        </Flex>
                      </Flex>
                    </List.Item>
                  ))}
                </List.Root>
              );
            })}
          </Flex>
        ) : (
          <Flex
            width="100%"
            height="200px"
            justifyContent="center"
            alignItems="center"
          >
            <Text textStyle="md" color="gray.500">
              No tasks available. Please create a new task.
            </Text>
          </Flex>
        )}
      </Flex>
    </div>
  );
}
