import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faPlus, faTrash);

const DELETE_DOCUMENT = gql`
  mutation removeDocument($id: String!) {
    removeDocument(id: $id) {
      _id
    }
  }
`;

const ADD_DOCUMENT = gql`
  mutation addDocument($title: String!, $content: String!) {
    addDocument(title: $title, content: $content) {
      _id
      title
      content
    }
  }
`;

const Documents = ({ data, client, handleSetDocument }) => (
  <div className="panel">
    <div className="panel-heading">
      <div className="float-left mt-1">MarkDownEditor</div>
      <Mutation
        mutation={ADD_DOCUMENT}
        onCompleted={response => {
          const documents = data.documents;
          const document = response.addDocument;
          documents.push({ ...document });
          handleSetDocument(document);
          client.writeData({ data: { documents } });
        }}
      >
        {(addDocument, { loading, error }) => (
          <div className="float-right">
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                addDocument({
                  variables: {
                    title: `Document ${data.documents
                      .length + 1}`,
                    content: ''
                  }
                });
              }}
              className="btn btn-link"
            >
              <FontAwesomeIcon className={"text-success"} icon="plus" />
            </button>
            {loading && <p>Loading...</p>}
            {error && <p>Error :( Please try again</p>}
          </div>
        )}
      </Mutation>
    </div>
    <div className="panel-body">
      <table className="table table-stripe">
        <tbody>
          {data.documents.map((document, index) => (
            <tr key={index}>
              <td>
                <div
                  onClick={e => {
                    e.preventDefault();
                    handleSetDocument(document)
                  }}
                  className="float-left mt-1"
                >
                  <p className={"font-weight-bold"}>{document.title}</p>
                </div>
                <Mutation
                  mutation={DELETE_DOCUMENT}
                  key={document._id}
                  onCompleted={response => {
                    const id = response.removeDocument._id;
                    const documents = data.documents.filter(
                      doc => doc._id !== id
                    );
                    client.writeData({
                      data: { documents }
                    });
                  }}
                >
                  {(removeDocument, { loading, error }) => (
                    <div className="float-right">
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={e => {
                          e.preventDefault();
                          removeDocument({
                            variables: { id: document._id }
                          });
                        }}
                      >
                        <FontAwesomeIcon className={"text-danger"} icon="trash" />
                      </button>
                      {loading && <p>Loading...</p>}
                      {error && (
                        <p>Error :( Please try again</p>
                      )}
                    </div>
                  )}
                </Mutation>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Documents;