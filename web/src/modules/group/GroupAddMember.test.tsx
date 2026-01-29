// src/modules/group/GroupAddMember.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupAddMember from "./GroupAddMember";

// -------------------- controls/mocks --------------------
let currentGroupValue: any = { id: 7 };
const findAllNotInGroupByTermMock = vi.fn();

// We’ll capture the props passed to AsyncMultiSelect so we can call fetchOptions()
let lastAsyncMultiSelectProps: any = null;

vi.mock("./GroupContext", () => ({
  useGroupContext: () => ({ currentGroup: currentGroupValue }),
}));

vi.mock("@/modules/user/user.service", () => ({
  userService: {
    findAllNotInGroupByTerm: (...args: any[]) => findAllNotInGroupByTermMock(...args),
  },
}));

vi.mock("@/components", () => ({
  AsyncMultiSelect: (props: any) => {
    lastAsyncMultiSelectProps = props;

    // minimal UI to let us test selection updates via onChange
    return (
      <div data-testid="async-multi-select">
        <button
          type="button"
          onClick={() =>
            props.onChange([
              ...(props.value ?? []),
              { id: 1, label: "Ana" },
              { id: 2, label: "Bruno" },
            ])
          }
        >
          Simular seleção
        </button>
      </div>
    );
  },
}));

// -------------------- tests --------------------
describe("<GroupAddMember />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentGroupValue = { id: 7 };
    lastAsyncMultiSelectProps = null;
  });

  it("renders title and AsyncMultiSelect", () => {
    render(<GroupAddMember />);

    expect(screen.getByText("Novo Membro")).toBeInTheDocument();
    expect(screen.getByTestId("async-multi-select")).toBeInTheDocument();
  });

  it("passes correct props to AsyncMultiSelect (controlled value + onChange + fetchOptions)", () => {
    render(<GroupAddMember />);

    expect(lastAsyncMultiSelectProps).toBeTruthy();
    expect(lastAsyncMultiSelectProps.label).toBe("");
    expect(Array.isArray(lastAsyncMultiSelectProps.value)).toBe(true);
    expect(typeof lastAsyncMultiSelectProps.onChange).toBe("function");
    expect(typeof lastAsyncMultiSelectProps.fetchOptions).toBe("function");
  });

  it("fetchOptions calls userService.findAllNotInGroupByTerm with currentGroup.id and query, and maps to {id,label}", async () => {
    findAllNotInGroupByTermMock.mockResolvedValueOnce([
      { id: 10, name: "Carla" },
      { id: 11, name: "Diego" },
    ]);

    render(<GroupAddMember />);

    // call the fetchOptions passed to AsyncMultiSelect
    const result = await lastAsyncMultiSelectProps.fetchOptions("ca");

    expect(findAllNotInGroupByTermMock).toHaveBeenCalledTimes(1);
    expect(findAllNotInGroupByTermMock).toHaveBeenCalledWith(7, "ca");

    expect(result).toEqual([
      { id: 10, label: "Carla" },
      { id: 11, label: "Diego" },
    ]);
  });

  it("renders selected items labels in the list after AsyncMultiSelect triggers onChange", async () => {
    render(<GroupAddMember />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Simular seleção" }));

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });

  it("uses currentGroup.id from context (different id)", async () => {
    currentGroupValue = { id: 99 };
    findAllNotInGroupByTermMock.mockResolvedValueOnce([{ id: 1, name: "X" }]);

    render(<GroupAddMember />);

    await lastAsyncMultiSelectProps.fetchOptions("x");

    expect(findAllNotInGroupByTermMock).toHaveBeenCalledWith(99, "x");
  });
});
