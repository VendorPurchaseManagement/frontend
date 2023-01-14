import {SearchOutlined} from "@ant-design/icons";
import {Button, Checkbox, Drawer, Input, Space} from "antd";
import {useEffect, useState} from "react";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";

interface initialStateInterface {
  open: boolean;
  columnsToShow: any[];
  searchValue: string;
}

const DynamicCols = ({
  openCols,
  closeDrawer,
  columns,
  updateCols,
}: {
  openCols: boolean;
  closeDrawer: () => void;
  columns: any[];
  updateCols: (arr: any[]) => void;
}) => {
  const initialState: initialStateInterface = {
    open: openCols,
    columnsToShow: columns,
    searchValue: "",
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    setState((prev) => ({...prev, open: openCols}));
  }, [openCols]);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      columnsToShow: state.columnsToShow.map((each, index) => {
        return {
          ...each,
          show: true,
          id: index,
        };
      }),
    }));
  }, []);

  const onChange = (e: any, title: string) => {
    const index = state.columnsToShow.findIndex((each) => each.title === title);
    if (index === -1) return;
    setState((prev) => {
      state.columnsToShow[index].show = e.target.checked;
      return {...prev};
    });
  };

  const dragAndDrop = (droppedItem: any) => {
    if (!droppedItem.destination) return;
    let updatedList = [...state.columnsToShow];
    const [reorderedItems] = updatedList.splice(droppedItem.source.index, 1);
    updatedList.splice(droppedItem.destination.index, 0, reorderedItems);
    setState((prev) => ({...prev, columnsToShow: updatedList}));
  };

  return (
    <>
      <Drawer
        title={`Columns Configuration`}
        placement="right"
        size={`default`}
        onClose={closeDrawer}
        open={state.open}
        extra={
          <Space>
            <Button
              type="primary"
              disabled={
                state.columnsToShow.filter((each) => each.show === true)
                  .length === 0
              }
              onClick={() => {
                updateCols(
                  state.columnsToShow.filter((each) => each.show === true)
                );
                closeDrawer();
              }}
            >
              APPLY
            </Button>
          </Space>
        }
      >
        <Input
          placeholder="Search Columns"
          prefix={<SearchOutlined className="mr-2" />}
          onChange={(e) =>
            setState((prev) => ({...prev, searchValue: e.target.value}))
          }
          style={{width: "100%", marginBottom: "20px"}}
        />

        <DragDropContext onDragEnd={dragAndDrop}>
          <Droppable droppableId="list-container">
            {(provided) => (
              <div
                className="list-container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {state.columnsToShow
                  .filter(
                    (each) =>
                      !each.title
                        .toLowerCase()
                        .indexOf(state.searchValue.toLowerCase())
                  )
                  .map((item, index) => (
                    <Draggable
                      key={item.title}
                      draggableId={item.title}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="flex justify-between my-3 px-3 py-3 shadow border border-gray-200 rounded dark:border-gray-700"
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                        >
                          {item.title}
                          <Checkbox
                            onChange={(e) => onChange(e, item.title)}
                            checked={item.show}
                          ></Checkbox>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* <List>
          <VirtualList
            data={state.columnsToShow.filter(
              (each) =>
                !each.title
                  .toLowerCase()
                  .indexOf(state.searchValue.toLowerCase())
            )}
            height={400}
            itemHeight={47}
            itemKey="id"
          >
            {(item: any) => (
              <List.Item key={`${item.index}`}>
                <List.Item.Meta title={<>{item.title}</>} />
                <Checkbox
                  onChange={(e) => onChange(e, item.title)}
                  checked={item.show}
                ></Checkbox>
              </List.Item>
            )}
          </VirtualList>
        </List> */}
      </Drawer>
    </>
  );
};

export default DynamicCols;
