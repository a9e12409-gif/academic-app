import { Fragment } from "react";

export default function Skeleton() {
  return (
    <div className="skel-screen" aria-hidden="true">
      <div className="skel-row"><i className="sk sk-w40" /><i className="sk sk-w24" /></div>
      <div className="skel-chips">{Array.from({ length: 7 }, (_, i) => <i key={i} className="sk" />)}</div>
      <i className="sk sk-hero" />
      <div className="skel-line">
        {Array.from({ length: 4 }, (_, i) => (
          <Fragment key={i}>
            <i className="sk sk-dot" /><i className="sk sk-name" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
