import { createTaskApi, getTaskListApi } from "@/apis/task.api";
import useAuthStore from "@/store/useAuthStore";
import useAxiosPrivate from "@/utils/axios/useAxiosPrivate";
import { TASK_STATUS, TASK_STATUS_META } from "@/utils/constants";
import type { CreateTaskDto, Task } from "@/utils/types/task.type";
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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const statusColorMap = {
  [TASK_STATUS.TODO]: "gray",
  [TASK_STATUS.IN_PROGRESS]: "blue",
  [TASK_STATUS.DONE]: "green",
} as const;

export default function TaskListPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const axiosPrivate = useAxiosPrivate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateTaskDto>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTaskListApi(axiosPrivate);
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast.error("Failed to fetch tasks. Please try again.");
      }
    };
    fetchTasks();
  }, [axiosPrivate]);

  const onSaveTask = handleSubmit(async (data) => {
    try {
      console.log(data);
      await createTaskApi(axiosPrivate, data);
      toast.success("Task created successfully!");
      const fetchTasks = await getTaskListApi(axiosPrivate);
      setTasks(fetchTasks);
    } catch (error) {
      toast.error("Failed to create task. Please try again.");
      console.error("Registration error:", error);
    }
  });

  return (
    <div className="flex justify-center h-screen">
      <div
        className="w-full max-w-[600px] flex flex-col gap-10"
        style={{ paddingTop: "100px" }}
      >
        <Flex
          padding="4"
          boxShadow={"md"}
          borderRadius="md"
          gap="4"
          flexDirection="column"
        >
          <Text textStyle="2xl" fontWeight="bold">
            {user?.fullName}
          </Text>
          <Text textStyle="md">{user?.email}</Text>
        </Flex>
        <Flex gap="4" width="100%" justifyContent="space-between">
          <p />
          <Heading>Task list</Heading>
          <Dialog.Root placement={"center"} motionPreset="slide-in-bottom">
            <Dialog.Trigger asChild>
              <Button size="sm" backgroundColor="blue.400">
                Open Dialog
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content backgroundColor={"white"}>
                  <Dialog.Header>
                    <Dialog.Title>Create Task</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap="4">
                      <Field.Root invalid={!!errors.title}>
                        <Field.Label>
                          Title <Field.RequiredIndicator />
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
                          Description <Field.RequiredIndicator />
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
                          Due date <Field.RequiredIndicator />
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

        <List.Root gap="2" variant="plain" align="center">
          {tasks?.map((item) => (
            <List.Item
              paddingBottom="2"
              key={item.id}
              borderBottom="1px solid #e2e8f0"
            >
              <Flex direction="column" gap="1" width={"100%"}>
                <Flex direction="row" gap="2" justifyContent="space-between">
                  {/* <List.Indicator asChild color="green.500">
                    <LuCircleCheck />
                  </List.Indicator> */}
                  <Flex gap="2" alignItems="center">
                    <Text textStyle="md" fontWeight="bold">
                      {item.title} -{" "}
                      {new Date(item?.dueDate).toLocaleDateString()}
                    </Text>
                    <Badge
                      colorPalette={statusColorMap[item.status]}
                      size="sm"
                      height="fit-content"
                      padding="2px 8px"
                    >
                      {item.status}
                    </Badge>
                  </Flex>
                  <Button size="sm" backgroundColor="gray.400">
                    Update
                  </Button>
                </Flex>
                <Text textStyle="md" fontWeight="bold">
                  {item.description}
                </Text>
              </Flex>
            </List.Item>
          ))}
        </List.Root>
      </div>
    </div>
  );
}
