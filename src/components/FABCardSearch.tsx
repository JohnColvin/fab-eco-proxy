import React, { useCallback, useEffect, useMemo, useState } from "react";
import FABCard from "./FABCard";
import {
  ButtonGroup,
  Col,
  Container,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from "react-bootstrap";
import EcoProxyCard from "../db/interfaces";
import { cards } from "@flesh-and-blood/cards";
import { Card } from "@flesh-and-blood/types";
import debounce from 'lodash/debounce'
import Search from "@flesh-and-blood/search";
import FABCardsListItem from "./FABCardSearchListItemt";
import ToggleButton from "react-bootstrap/ToggleButton";
import * as Icon from "react-bootstrap-icons";
import { getCardsQuantityById } from "../utils";

interface FABCardSearchProps {
  addCardToPrint: (card: EcoProxyCard) => void;
  addedCards: EcoProxyCard[];
}

enum SearchDisplayMode {
  Cards = "cards",
  List = "list",
}

const { search: searchCards } = new Search(cards)

const useDebounce = (func: any, delay: number) => useMemo(() => debounce(func, delay), [func, delay])

export default function FABCardSearch(props: FABCardSearchProps) {
  const { addCardToPrint, addedCards } = props;
  const [searchTerm, setSearchTerm] = useState('');
  // const [results, setResults] = useState<Index.Result[]>([]);
  const [results, setResults] = useState<Card[]>([]);
  const [mode, setMode] = useState<SearchDisplayMode>(SearchDisplayMode.List);
  const [isSearching, setIsSearching] = useState(false)

  const search = useCallback((query: string) => {
    setResults(query.length > 0 ? searchCards(query).searchResults : []);
    setIsSearching(false);
  }, [])

  const debouncedSearch = useDebounce(search, 750)

  const handleChange = (value: string) => {
    setIsSearching(true);
    debouncedSearch.cancel();
    setSearchTerm(value);
  };

  useEffect(() => debouncedSearch(searchTerm), [debouncedSearch, searchTerm]);

  const idCountMap = getCardsQuantityById(addedCards);

  return (
    <div className="card-search">
      <Container>
        <Row className="mb-3">
          <Col>
            <InputGroup>
              <InputGroup.Text>
                <Icon.Search size={17} />
              </InputGroup.Text>
              <Form.Control
                autoFocus
                defaultValue={searchTerm}
                type="text"
                placeholder="Search"
                onChange={(event) => handleChange(event.target.value)}
              />
            </InputGroup>
            <Form.Text id="help-search" muted>
              Enter card name or set identifier
            </Form.Text>
          </Col>
          <Col
            xs={12}
            lg="2"
            md={2}
            className="d-flex justify-content-end align-items-start"
          >
            <ButtonGroup>
              <ToggleButton
                id="tbg-btn-1"
                value={SearchDisplayMode.Cards}
                checked={mode === SearchDisplayMode.Cards}
                variant="outline-secondary"
                onChange={(e) => setMode(e.target.value as SearchDisplayMode)}
                type="radio"
              >
                <Icon.Grid3x2Gap size={17} />
              </ToggleButton>
              <ToggleButton
                id="tbg-btn-2"
                value={SearchDisplayMode.List}
                checked={mode === SearchDisplayMode.List}
                variant="outline-secondary"
                onChange={(e) => setMode(e.target.value as SearchDisplayMode)}
                type="radio"
              >
                <Icon.ListTask size={17} />
              </ToggleButton>
            </ButtonGroup>
          </Col>
        </Row>
        { isSearching && 'Searching...' }
        {!isSearching && mode === SearchDisplayMode.Cards && (
          <Row>
            {results.map((res, i) => (
              <Col md="4" lg="3" xl="2" key={res.cardIdentifier}>
                <FABCard
                  card={res}
                  addCardToPrint={addCardToPrint}
                  fromSearch={true}
                  quantity={
                    idCountMap[res.cardIdentifier]
                      ? idCountMap[res.cardIdentifier].count
                      : undefined
                  }
                />
              </Col>
            ))}
          </Row>
        )}
        {!isSearching && mode === SearchDisplayMode.List && (
          <ListGroup>
            {results.map((res, i) => (
              <FABCardsListItem
                key={res.cardIdentifier}
                card={res}
                addCardToPrint={addCardToPrint}
                quantity={
                  idCountMap[res.cardIdentifier]
                    ? idCountMap[res.cardIdentifier].count
                    : undefined
                }
              />
            ))}
          </ListGroup>
        )}
      </Container>
    </div>
  );
}
