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
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
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
  });

  it("shows review states in the phase 0 workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByText(
        "第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
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

  it("shows a task type selector for volunteers", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "可信度判斷" }));

    expect(screen.getByLabelText("志工任務類型")).toBeInTheDocument();
  });

  it("sorts volunteer tasks by trustworthiness and realism", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "可信度判斷" }));

    fireEvent.change(screen.getByLabelText("現場情況"), {
      target: { value: "需要醫療協助" },
    });
    fireEvent.change(screen.getByLabelText("信心程度"), {
      target: { value: "高" },
    });
    fireEvent.change(screen.getByLabelText("建議志工特長"), {
      target: { value: "醫療支援" },
    });
    fireEvent.change(screen.getByLabelText("補充說明"), {
      target: { value: "大樓二樓，地點明確，現在需要立即協助" },
    });
    fireEvent.click(screen.getByRole("button", { name: "新增到任務欄" }));

    fireEvent.change(screen.getByLabelText("現場情況"), {
      target: { value: "需要食物" },
    });
    fireEvent.change(screen.getByLabelText("信心程度"), {
      target: { value: "低" },
    });
    fireEvent.change(screen.getByLabelText("建議志工特長"), {
      target: { value: "搬運" },
    });
    fireEvent.change(screen.getByLabelText("補充說明"), {
      target: { value: "不確定" },
    });
    fireEvent.click(screen.getByRole("button", { name: "新增到任務欄" }));

    const taskTitles = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(taskTitles[0]).toContain("需要醫療協助");
    expect(taskTitles[0]).toContain("高可信度");
  });

  it("keeps draft CRUD as learner work instead of starter output", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText("尚未建立整理草稿")).toBeInTheDocument();
    expect(
      screen.getByText(/請 agent 加上建立、編輯、刪除或重設整理草稿/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/已產生 \d+ 筆安全邊界草稿/),
    ).not.toBeInTheDocument();
  });
});
