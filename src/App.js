import React, { Component } from 'react';
import './App.css';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { ApolloConsumer } from 'react-apollo';
import Preview from './components/Preview';
import Editor from './components/Editor';
import Documents from './components/Documents';
import showdown from 'showdown';
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

class App extends Component {
  state = {
    document: []
  };

  handleSetDocument = (document) => {
    this.setState({ document });
  }

  cleanDocumentSelected = () => {
    this.setState({ document: [] });
  }

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
                      <Documents
                        data={data}
                        client={client}
                        handleSetDocument={this.handleSetDocument}
                        cleanDocumentSelected={this.cleanDocumentSelected}
                      />
                    </div>
                    <div className="col-5">
                      {this.state.document && (this.state.document.content || this.state.document.content === '') && (
                        <Editor
                          data={data}
                          state={this.state}
                          client={client}
                          handleSetDocument={this.handleSetDocument}
                          handleChange={this.handleChange}
                        />
                      )}
                    </div>
                    <div className="col-5">
                      {this.state.document && (this.state.document.content || this.state.document.content === '') && (
                        <Preview
                          content={converter.makeHtml(this.state.document.content)}
                        />
                      )}
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
