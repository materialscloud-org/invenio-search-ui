/*
 * This file is part of Invenio.
 * Copyright (C) 2020 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import PropTypes from "prop-types";
import React, { useContext } from "react";
import Overridable, {
  OverridableContext,
  overrideStore,
} from "react-overridable";
import {
  BucketAggregation,
  EmptyResults,
  Error,
  InvenioSearchApi,
  ReactSearchKit,
  ResultsLoader,
  withState,
  buildUID,
} from "react-searchkit";
import { GridResponsiveSidebarColumn } from "react-invenio-forms";
import { Container, Grid, Button, Popup, Icon } from "semantic-ui-react";
import { Results, ResultOptions } from "./Results";
import { SearchBar } from "./SearchBar";
import { SearchConfigurationContext } from "./context";
import { i18next } from "@translations/invenio_app_rdm/i18next";


const OnResults = withState(Results);
const ResultOptionsWithState = withState(ResultOptions);

export const SearchAppFacets = ({ aggs }) => {
  const { buildUID } = useContext(SearchConfigurationContext);
  return (
    <Overridable id={buildUID("SearchApp.facets")} aggs={aggs}>
      <>
        {aggs.map((agg) => (
          <BucketAggregation key={agg.title} title={agg.title} agg={agg.agg} />
        ))}
      </>
    </Overridable>
  );
};

export const SearchAppResultsPane = ({ layoutOptions }) => {
  const { buildUID } = useContext(SearchConfigurationContext);
  return (
    <Overridable
      id={buildUID("SearchApp.resultsPane")}
      layoutOptions={layoutOptions}
    >
      <ResultsLoader>
        <EmptyResults />
        <Error />
        <OnResults />
      </ResultsLoader>
    </Overridable>
  );
};

export const SearchApp = ({ config, appName }) => {
  const [sidebarVisible, setSidebarVisible] = React.useState(false);
  const searchApi = new InvenioSearchApi(config.searchApi);
  const context = {
    appName,
    buildUID: (element) => buildUID(element, "", appName),
    ...config,
  };
  return (
    <OverridableContext.Provider value={overrideStore.getAll()}>
      <SearchConfigurationContext.Provider value={context}>
        <ReactSearchKit
          searchApi={searchApi}
          appName={appName}
          initialQueryState={config.initialQueryState}
          defaultSortingOnEmptyQueryString={
            config.defaultSortingOnEmptyQueryString
          }
        >
          <Overridable
            id={buildUID("SearchApp.layout", "", appName)}
            config={config}
          >
            <Container>
              <Overridable
                id={buildUID("SearchApp.searchbarContainer", "", appName)}
              >
                <Grid relaxed padded>
                  <Grid.Row>
                    <Grid.Column width={12} floated="right">
                      <Overridable
                        id={buildUID("SearchApp.searchbar", "", appName)}
                      >
                        <SearchBar />
                      </Overridable>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Overridable>

              <Grid relaxed>

                <div className="two column row rel-mt-2">
                  <div className="computer only four wide column"></div>
                  <div className="twelve wide computer sixteen wide mobile sixteen wide tablet column">
                    <div className="ui grid">
                      <div className="middle aligned row" style={{"padding-bottom": "0px"}}>
                        <div className="left eight wide column">
                          <div style={{"display": "flex", "align-items": "center"}}>
                            <h2 style={{"margin": "0px"}}>Shared records</h2>
                            <Popup
                                trigger={<Icon className="ml-5" name="info circle" style={{"line-height": "normal"}}/>}
                                content={"Use the search box to filter through all shared records. The search guide provides examples of search queries."}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Grid.Row
                  textAlign="right"
                  columns={2}
                  className="result-options rel-mt-2"
                >
                  <Grid.Column
                    only="mobile tablet"
                    mobile={2}
                    tablet={1}
                    textAlign="center"
                    verticalAlign="middle"
                  >
                    <Button
                      basic
                      icon="sliders"
                      onClick={() => setSidebarVisible(true)}
                      aria-label={i18next.t("Filter results")}
                    />
                  </Grid.Column>

                  <Grid.Column mobile={14} tablet={15} computer={12} floated="right">
                    <ResultOptionsWithState
                      sortOptions={config.sortOptions}
                      layoutOptions={config.layoutOptions}
                    />
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={2}>
                  <GridResponsiveSidebarColumn
                    width={4}
                    open={sidebarVisible}
                    onHideClick={() => setSidebarVisible(false)}
                    children={
                      <SearchAppFacets aggs={config.aggs} />
                    }
                  />
                  <Grid.Column mobile={16} tablet={16} computer={12}>
                    <SearchAppResultsPane
                      layoutOptions={config.layoutOptions}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Container>
          </Overridable>
        </ReactSearchKit>
      </SearchConfigurationContext.Provider>
    </OverridableContext.Provider>
  );
};

SearchApp.propTypes = {
  config: PropTypes.shape({
    searchApi: PropTypes.object.isRequired, // same as ReactSearchKit.searchApi
    initialQueryState: PropTypes.shape({
      queryString: PropTypes.string,
      sortBy: PropTypes.string,
      sortOrder: PropTypes.string,
      page: PropTypes.number,
      size: PropTypes.number,
      hiddenParams: PropTypes.array,
      layout: PropTypes.oneOf(["list", "grid"]),
    }),
    aggs: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        aggName: PropTypes.string,
        access_right: PropTypes.string,
        mapping: PropTypes.object,
      })
    ),
    sortOptions: PropTypes.arrayOf(
      PropTypes.shape({
        sortBy: PropTypes.string,
        sortOrder: PropTypes.string,
        text: PropTypes.string,
      })
    ),
    paginationOptions: PropTypes.shape({
      resultsPerPage: PropTypes.arrayOf(
        PropTypes.shape({
          text: PropTypes.string,
          value: PropTypes.number,
        })
      ),
    }),
    layoutOptions: PropTypes.shape({
      listView: PropTypes.bool.isRequired,
      gridView: PropTypes.bool.isRequired,
    }).isRequired,
    defaultSortingOnEmptyQueryString: PropTypes.shape({
      sortBy: PropTypes.string,
      sortOrder: PropTypes.string,
    }),
  }).isRequired,
  appName: PropTypes.string,
};

SearchApp.defaultProps = {
  config: {
    searchApi: {
      url: "",
      withCredentials: false,
      headers: {},
    },
    initialQueryState: {},
    aggs: [],
    sortOptions: [],
    paginationOptions: {},
    layoutOptions: {
      listView: true,
      gridView: false,
    },
    defaultSortingOnEmptyQueryString: {},
  },
  appName: null,
};
