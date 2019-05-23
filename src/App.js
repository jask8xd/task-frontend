import React, { Component } from 'react';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { ApolloConsumer } from 'react-apollo';
import showdown from 'showdown';
library.add(faPlus, faTrash, faSave);
const converter = new showdown.Converter();

const GET_DOCUMENTS = gql`
  {
    documents {
      _id
      title
      content
    }
  }
`;

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

const UPDATE_DOCUMENT = gql`
  mutation updateDocument($id: String!, $title: String!, $content: String!) {
    updateDocument(id: $id, title: $title, content: $content) {
      _id
      title
      content
    }
  }
`;

class App extends Component {
  state = {
    document: []
  };

  handleChange = event => {
    const content = event.target.value;
    const document = {
      ...this.state.document,
      content
    };
    this.setState({ document });
  };

  render() {
    return (
      <ApolloConsumer>
        {client => (
          <Query query={GET_DOCUMENTS}>
            {({ loading, error, data }) => {
              if (loading) return 'Loading...';
              if (error) return `Error! ${error.message}`;
              return (
                <div className="container">
                  <div className="row">
                    <div className="col-2">
                      <div className="panel">
                        <div className="panel-heading">
                          <div className="float-left">MarkDownEditor</div>
                          <Mutation
                            mutation={ADD_DOCUMENT}
                            onCompleted={response => {
                              const documents = data.documents;
                              const document = response.addDocument;
                              documents.push({ ...document });
                              this.setState({ document });
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
                                        content: ' '
                                      }
                                    });
                                  }}
                                  className="btn-light"
                                >
                                  <FontAwesomeIcon icon="plus" />
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
                                        this.setState({ document });
                                      }}
                                      className="float-left"
                                    >
                                      {document.title}
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
                                            className="btn-light"
                                            onClick={e => {
                                              e.preventDefault();
                                              removeDocument({
                                                variables: { id: document._id }
                                              });
                                            }}
                                          >
                                            <FontAwesomeIcon icon="trash" />
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
                    </div>
                    <div className="col-5">
                      <div className="w-100">
                        {this.state.document && this.state.document.content && (
                          <div className="panel">
                            <div className="panel-heading">
                              <div className="float-left">Editor</div>
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
                                    this.setState({ document });
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
                                            title: this.state.document.title,
                                            content: this.state.document
                                              .content,
                                            id: this.state.document._id
                                          };
                                          updateDocument({
                                            variables: {
                                              ...document
                                            }
                                          });
                                        }}
                                        className="btn-light"
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
                                value={this.state.document.content}
                                onChange={this.handleChange}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-5">
                      <div className="w-100">
                        {this.state.document && this.state.document.content && (
                          <div className="panel">
                            <div className="panel-heading">
                              <div className="w-100 float-left">Preview</div>
                            </div>
                            <div className="panel-body">
                              <div
                                className="w-100"
                                dangerouslySetInnerHTML={{
                                  __html: converter.makeHtml(
                                    this.state.document.content
                                  )
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </Query>
        )}
      </ApolloConsumer>
    );
  }
}

export default App;
