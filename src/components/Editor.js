import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faSave);

const UPDATE_DOCUMENT = gql`
  mutation updateDocument($id: String!, $title: String!, $content: String!) {
    updateDocument(id: $id, title: $title, content: $content) {
      _id
      title
      content
    }
  }
`;

const Editor = ({ data, state, client, handleSetDocument, handleChange }) => (
  <div className="panel">
    <div className="panel-heading">
      <div className="float-left mt-1"><p className={"font-italic"}>{`Editor : ${state.document.title}`}</p></div>
      <div className="float-right">
        <Mutation
          mutation={UPDATE_DOCUMENT}
          onCompleted={response => {
            const document = response.updateDocument;
            const documents = data.documents.map(d => {
              return d._id === document._id
                ? document
                : d;
            });
            handleSetDocument(document);
            client.writeData({ data: { documents } });
          }}
        >
          {(updateDocument, { loading, error }) => (
            <div className="float-right">
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  const document = {
                    title: state.document.title,
                    content: state.document
                      .content,
                    id: state.document._id
                  };
                  updateDocument({
                    variables: {
                      ...document
                    }
                  });
                }}
                className="btn btn-link"
              >
                <FontAwesomeIcon icon="save" />
              </button>
              {loading && <p>Loading...</p>}
              {error && (
                <p>
                  {JSON.stringify(error)}Error :( Please
                  try again
                </p>
              )}
            </div>
          )}
        </Mutation>
      </div>
    </div>
    <div className="panel-body">
      <textarea
        rows={10}
        className="w-100"
        value={state.document.content}
        onChange={handleChange}
      />
    </div>
  </div>
);

export default Editor;