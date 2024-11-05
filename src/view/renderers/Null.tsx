import React from "react";
import { borderRadius, ComponentProps, isDescendantOf, renderContext, useFocusable } from "./utils";
import { observer } from "mobx-react";
import { BlockTemplate } from "./Block";
import { NodeElement } from "../../AOM/types";
import styled from "styled-components";

export function Collapsed({ children }: { children: React.ReactChild }) {
  const [isCollapsed, toggleCollapsed] = React.useReducer((state) => !state, true);
  return (
    <CollapsedEl isCollapsed={isCollapsed} onClick={toggleCollapsed}>
      {isCollapsed ? "…" : children || "(empty)"}
    </CollapsedEl>
  );
}

export const CollapsedEl = styled.span<{ isCollapsed: boolean }>`
  display: inline-block;
  background: #353535;
  color: #888;
  padding: 2px;
  border-radius: ${borderRadius};
  cursor: pointer;
  margin-right: 5px;

  ::before {
    content: "[";
  }

  ::after {
    content: "]";
  }

  :hover {
    color: #eee;
    background: #555;
  }
`;

const NewLine = styled.div`
  margin: 10px 0 5px 0;
`;

export function isLabelDescendantOrSiblingOfLabelledNode(label: NodeElement) {
  const siblings = label.htmlParent?.htmlChildren?.filter((x) => x.hasContent);
  if (!siblings) {
    return false;
  }
  const index = siblings.indexOf(label);

  for (const labelled of label.relations.labelOf) {
    if (isDescendantOf(label, labelled)) return true;
    if (siblings[index - 1] === labelled) return true;
    if (siblings[index + 1] === labelled) return true;
  }

  return false;
}

export default observer(function Null({ node }: ComponentProps) {
  const render = React.useContext(renderContext);
  const content = render(node.children);
  const [ref, style] = useFocusable(node);

  if (typeof content === "string" && content.trim() === "") {
    return null;
  }

  if (node.htmlTag !== "body" && (node.isFocused || (node.attributes.tabindex as number) >= 0)) {
    return (
      <BlockTemplate
        role={`<${node.htmlTag}>`}
        ref={ref}
        style={style}
        color="#666"
        header={node.hasCustomAccessibleName ? node.accessibleName : undefined}
        node={node}
      >
        {content}
      </BlockTemplate>
    );
  }

  if (isLabelDescendantOrSiblingOfLabelledNode(node)) {
    return <Collapsed>{content}</Collapsed>;
  }

  if (node.htmlTag === "p") {
    return <div style={{ margin: "10px 0" }}>{content}</div>;
  }

  return (
    <div data-key={node.key} data-html-tag={node.htmlTag} style={{ display: "contents" }}>
      {node.htmlTag === "label" && <NewLine />}
      {!node.isInline && !node.isFirstChild && " "}
      {content}
      {!node.isInline && !node.isLastChild && " "}
    </div>
  );
});
