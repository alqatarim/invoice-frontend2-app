import React from "react";
import Link from "next/link";

export function itemRender(current, type, originalElement) {
  if (type === "prev") {
    return <Link href="#"><a>Previous</a></Link>;
  }
  if (type === "next") {
    return <Link href="#"><a>Next</a></Link>;
  }
  return originalElement;
}

export function onShowSizeChange(current, pageSize) {
  console.log(current, pageSize);
}
