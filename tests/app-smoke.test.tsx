import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  it("renders starter title", () => {
    render(<App />);
    expect(screen.getByText("災害資訊整理工作台")).toBeInTheDocument();
  });

  it("keeps the home page focused on phase 0 tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "原始資訊" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "可信度判斷" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "整理工作台" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通報" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "地點" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "志工任務" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "人員指派" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "進入 v1 流程工作台" }),
    ).toHaveAttribute("href", "/v1/");
  });

  it("renders the v1 flow workbench on /v1/", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    expect(screen.getByText("從原始求助到人工審核")).toBeInTheDocument();
    expect(screen.getByText("新增災民求助")).toBeInTheDocument();
    expect(screen.getAllByText("審核中").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "正式任務欄" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("v1 流程階段")).not.toBeInTheDocument();
    expect(screen.queryByText("表單編修")).not.toBeInTheDocument();

    window.history.pushState({}, "", "/");
  });

  it("keeps v1 submissions pending until a reviewer approves them", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    fireEvent.change(screen.getByLabelText("災民現在遇到的困難"), {
      target: { value: "需要醫療協助" },
    });
    fireEvent.change(screen.getByLabelText("需要哪一類協助"), {
      target: { value: "醫療人員" },
    });
    fireEvent.change(screen.getByLabelText("大概位置或附近線索"), {
      target: { value: "車站東側出口" },
    });
    fireEvent.change(screen.getByLabelText("災民原始描述與整理備註"), {
      target: { value: "災民表示需要藥品協助，位置大約在車站附近。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送到審核中" }));

    expect(screen.getByText("V1-001")).toBeInTheDocument();
    expect(
      screen.getByText(
        "目前沒有正式任務，請先從審核中載入一筆資料並送出審核。",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "載入表單審核" })[0]);
    expect(screen.getByText("編修 V1-001")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("大概位置或附近線索"), {
      target: { value: "車站東側出口旁遮雨棚" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "送出審核並建立正式任務" }),
    );

    expect(screen.getByText("正式任務，尚未派工")).toBeInTheDocument();
    expect(screen.getByText("車站東側出口旁遮雨棚")).toBeInTheDocument();
    expect(screen.queryByText("已派工")).not.toBeInTheDocument();

    window.history.pushState({}, "", "/");
  });

  it("can delete a selected pending review item from the edit form", () => {
    window.history.pushState({}, "", "/v1/");

    render(<App />);

    fireEvent.change(screen.getByLabelText("災民現在遇到的困難"), {
      target: { value: "需要住宿" },
    });
    fireEvent.change(screen.getByLabelText("大概位置或附近線索"), {
      target: { value: "臨時集合點旁" },
    });
    fireEvent.change(screen.getByLabelText("災民原始描述與整理備註"), {
      target: { value: "重複送出的需求，資訊整理者判斷先刪除這筆待審資料。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送到審核中" }));

    expect(screen.getByText("V1-001")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "載入表單審核" })[0]);
    expect(screen.getByText("編修 V1-001")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "刪除審核中資料" }));

    expect(screen.getByText("新增災民求助")).toBeInTheDocument();
    expect(screen.queryByText("V1-001")).not.toBeInTheDocument();
    expect(screen.queryByText("正式任務，尚未派工")).not.toBeInTheDocument();

    window.history.pushState({}, "", "/");
  });

  it("shows a trust assessment page for the messy reports", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "可信度判斷" }));

    expect(
      screen.getByRole("heading", {
        name: /先看來源與查核狀態，再判斷這筆資訊能不能當作可採用線索。/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("建議狀態")).toBeInTheDocument();
    expect(screen.getByText("M-001")).toBeInTheDocument();
  });

  it("shows an assistance type selector for disaster survivors", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "可信度判斷" }));

    expect(screen.getByLabelText("需要的協助類型")).toBeInTheDocument();
  });

  it("routes survivor reports to pending review before formal tasks", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "可信度判斷" }));

    fireEvent.change(screen.getByLabelText("現場情況"), {
      target: { value: "需要醫療協助" },
    });
    fireEvent.change(screen.getByLabelText("目前狀況"), {
      target: { value: "仍需要協助" },
    });
    fireEvent.change(screen.getByLabelText("需要的協助專長"), {
      target: { value: "醫療支援" },
    });
    fireEvent.change(screen.getByLabelText("補充說明"), {
      target: { value: "大樓二樓，地點明確，現在需要立即協助" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送出審核" }));

    expect(screen.getByRole("status")).toHaveTextContent("已送出審核");
    expect(screen.getByText("審核中，尚未進入正式任務欄")).toBeInTheDocument();
    expect(screen.queryByText("高急迫度")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "進入 v1 流程工作台" }));

    expect(screen.getByText("從原始求助到人工審核")).toBeInTheDocument();
    expect(screen.getByText("災民表單送審")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "載入表單審核" })[0]);
    fireEvent.change(screen.getByLabelText("大概位置或附近線索"), {
      target: { value: "大樓二樓靠樓梯間" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "送出審核並建立正式任務" }),
    );

    expect(screen.getByText("正式任務，尚未派工")).toBeInTheDocument();
    expect(screen.getByText("大樓二樓靠樓梯間")).toBeInTheDocument();

    window.history.pushState({}, "", "/");
  });

  it("does not show the old workbench action from raw reports", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: "送到整理工作台" }),
    ).not.toBeInTheDocument();
  });
});
