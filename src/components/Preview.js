import React from 'react';

const Preview = ({ content }) => (
  <div className="panel">
    <div className="panel-heading">
      <div className="w-100 float-left mt-1"><p className={"font-italic"}>Preview</p></div>
    </div>
    <div className="panel-body">
      <div
        className="w-100"
        dangerouslySetInnerHTML={{
          __html: content
        }}
      />
    </div>
  </div>
);

export default Preview;