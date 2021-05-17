import React, { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import styled from "styled-components";
import { Button, Grid, Box } from "@sanity/ui";

function listToMatrix(list, elementsPerSubArray) {
  var matrix = [],
    i,
    k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }
    matrix[k].push(list[i]);
  }

  return matrix;
}

const Wrapper = styled.section`
  min-height: 300px;
  width: 100%;
`;

const SearchResults = ({ results, renderIcon, selected, onSelect, filter }) => {
  const COL_WIDTH = 50;
  const [filtered, setFiltered] = useState([]);
  const COLUMNS_COUNT = useMedia(
    // Media queries
    ["(min-width: 960px)", "(min-width: 640px)", "(min-width: 512px)"],
    // Column counts (relates to above media queries by array index)
    [6, 4, 2],
    // Default column count
    1
  );

  const getFiltered = (items) => {
    if (!filter) return items;
    return items.filter((item) => item.provider === filter);
  };
  const updateIcons = (cols) => {
    const icons = getFiltered(results);
    const mappedIcons = listToMatrix(Object.values(icons), cols);
    setFiltered(mappedIcons);
  };

  const createIconButton = (icon) => {
    return (
      <Button
        key={icon.id}
        mode="ghost"
        padding={[3, 3, 4]}
        onClick={() => onSelect(icon)}
        text={renderIcon(icon)}
        selected={selected && icon.name === selected.name}
      />
    );
  };

  const Row = ({ index, style }) => {
    return (
      <Grid key={index.toString()} style={style} columns={[1, 2, 4, 6]}>
        {filtered[index].map(createIconButton)}
      </Grid>
    );
  };

  const onResize = ({ width, height }) => {
    updateIcons(COLUMNS_COUNT);
  };

  return (
    <Wrapper>
      <AutoSizer onResize={onResize}>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={filtered.length}
            itemSize={70}
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </Wrapper>
  );
};

export default SearchResults;

function useMedia(queries, values, defaultValue) {
  // Array containing a media query list for each query
  const mediaQueryLists = queries.map((q) => window.matchMedia(q));
  // Function that gets value based on matching media query
  const getValue = () => {
    // Get index of first media query that matches
    const index = mediaQueryLists.findIndex((mql) => mql.matches);
    // Return related value or defaultValue if none
    return typeof values[index] !== "undefined" ? values[index] : defaultValue;
  };
  // State and setter for matched value
  const [value, setValue] = useState(getValue);
  useEffect(
    () => {
      // Event listener callback
      // Note: By defining getValue outside of useEffect we ensure that it has ...
      // ... current values of hook args (as this hook callback is created once on mount).
      const handler = () => setValue(getValue);
      // Set a listener for each media query with above handler as callback.
      mediaQueryLists.forEach((mql) => mql.addListener(handler));
      // Remove listeners on cleanup
      return () =>
        mediaQueryLists.forEach((mql) => mql.removeListener(handler));
    },
    [] // Empty array ensures effect is only run on mount and unmount
  );
  return value;
}