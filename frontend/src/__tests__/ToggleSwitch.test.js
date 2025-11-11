import { render, screen, fireEvent } from "@testing-library/react";
import ToggleSwitch from "../utils/ToggleSwitch";

describe("ToggleSwitch", () => {
  const handleChange = jest.fn();
  const originalError = console.error;
  const originalWarn = console.warn;

  beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });

  test("Renders toggle switch component", () => {
    const { container } = render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    const switchContainer = container.querySelector(".toggle-switch-container");
    expect(switchContainer).toBeTruthy();
  });

  test("Renders checkbox input with correct attributes", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        name="testSwitch"
        id="switch-1"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeTruthy();
    expect(checkbox.type).toBe("checkbox");
    expect(checkbox.name).toBe("testSwitch");
    expect(checkbox.id).toBe("switch-1");
  });

  test("Renders with checked state when checked prop is true", () => {
    render(
      <ToggleSwitch
        checked={true}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(true);
  });

  test("Renders with unchecked state when checked prop is false", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(false);
  });

  test("Calls onChange handler when checkbox is clicked", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={handleChange}
        name="test"
        id="test-id"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("Calls onChange handler when toggled from checked to unchecked", () => {
    render(
      <ToggleSwitch
        checked={true}
        onChange={handleChange}
        name="test"
        id="test-id"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("Renders with correct CSS classes", () => {
    const { container } = render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    const switchContainer = container.querySelector(".toggle-switch-container");
    const label = container.querySelector(".toggle-switch");
    const checkbox = container.querySelector(".toggle-switch-checkbox");
    const span = container.querySelector(".toggle-switch-label");

    expect(switchContainer).toBeTruthy();
    expect(label).toBeTruthy();
    expect(checkbox).toBeTruthy();
    expect(span).toBeTruthy();
  });

  test("Renders label element as wrapper", () => {
    const { container } = render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    const label = container.querySelector("label.toggle-switch");
    expect(label).toBeTruthy();
    expect(label.tagName).toBe("LABEL");
  });

  test("Renders span element for visual switch", () => {
    const { container } = render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    const span = container.querySelector("span.toggle-switch-label");
    expect(span).toBeTruthy();
    expect(span.tagName).toBe("SPAN");
  });

  test("Does not call onChange when not provided", () => {
    render(<ToggleSwitch checked={false} name="test" id="test-id" />);

    const checkbox = screen.getByRole("checkbox");
    expect(() => fireEvent.click(checkbox)).not.toThrow();
  });

  test("Updates when checked prop changes", () => {
    const { rerender } = render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    let checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(false);

    rerender(
      <ToggleSwitch
        checked={true}
        onChange={() => {}}
        name="test"
        id="test-id"
      />
    );

    checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(true);
  });

  test("Renders with unique id for multiple instances", () => {
    const { container } = render(
      <>
        <ToggleSwitch
          checked={false}
          onChange={() => {}}
          name="switch1"
          id="id-1"
        />
        <ToggleSwitch
          checked={false}
          onChange={() => {}}
          name="switch2"
          id="id-2"
        />
      </>
    );

    const checkbox1 = container.querySelector("#id-1");
    const checkbox2 = container.querySelector("#id-2");

    expect(checkbox1).toBeTruthy();
    expect(checkbox2).toBeTruthy();
    expect(checkbox1.id).toBe("id-1");
    expect(checkbox2.id).toBe("id-2");
  });

  test("Passes event object to onChange handler", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={handleChange}
        name="test"
        id="test-id"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    expect(handleChange.mock.calls[0][0].target).toBeTruthy();
  });
});
