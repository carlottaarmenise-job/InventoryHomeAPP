import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Home() {
  const [inventario, setInventario] = useState([]);
  const [listaSpesa, setListaSpesa] = useState([]);

  useEffect(() => {
    const unsubscribeInventario = onSnapshot(collection(db, 'inventario'), snapshot => {
      const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(dati);
    });

    const unsubscribeListaSpesa = onSnapshot(collection(db, 'listaSpesa'), snapshot => {
      const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListaSpesa(dati);
    });

    return () => {
      unsubscribeInventario();
      unsubscribeListaSpesa();
    };
  }, []);

  const oggi = new Date();
  const domani = new Date();
  domani.setDate(oggi.getDate() + 1);

  const inScadenza = inventario.filter(prod => new Date(prod.scadenza) <= domani);
  const quasiFiniti = inventario.filter(prod => Number(prod.quantita) === 1);
  const daAcquistare = listaSpesa.filter(p => !p.acquistato);
  const acquistati = listaSpesa.filter(p => p.acquistato);

  return (
    <div>
      <h1 className="mb-4 text-center">🏠 Dashboard Inventario</h1>

      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} md={3}>
          <Card className="h-100 shadow-sm border-0 bg-info text-white">
            <Card.Body>
              <Card.Title className="fw-bold">📦 Totale Prodotti</Card.Title>
              <Card.Text className="fs-3">{inventario.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="h-100 shadow-sm border-0 bg-warning text-dark">
            <Card.Body>
              <Card.Title className="fw-bold">🛒 Da Acquistare</Card.Title>
              <Card.Text className="fs-3">{daAcquistare.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="h-100 shadow-sm border-0 bg-success text-white">
            <Card.Body>
              <Card.Title className="fw-bold">✔️ Acquistati</Card.Title>
              <Card.Text className="fs-3">{acquistati.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="h-100 shadow-sm border-0 bg-secondary text-white">
            <Card.Body>
              <Card.Title className="fw-bold">📉 Quasi Finiti</Card.Title>
              <Card.Text className="fs-3">{quasiFiniti.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} md={6}>
          <Card className="h-100 shadow-sm border-0 bg-danger text-white">
            <Card.Body>
              <Card.Title className="fw-bold">⏰ In Scadenza (entro domani)</Card.Title>
              {inScadenza.length === 0 ? (
                <Card.Text>Nessun prodotto in scadenza imminente.</Card.Text>
              ) : (
                <ul className="mb-0">
                  {inScadenza.map(p => (
                    <li key={p.id}>
                      <Link to={`/inventario?focus=${p.id}`} className="text-white text-decoration-underline">
                        {p.nome} (scade il {p.scadenza})
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="h-100 shadow-sm border-0 bg-dark text-white">
            <Card.Body>
              <Card.Title className="fw-bold">⚠️ Quasi Finiti (quantità = 1)</Card.Title>
              {quasiFiniti.length === 0 ? (
                <Card.Text>Nessun prodotto quasi finito.</Card.Text>
              ) : (
                <ul className="mb-0">
                  {quasiFiniti.map(p => (
                    <li key={p.id}>
                      <Link to={`/inventario?focus=${p.id}`} className="text-white text-decoration-underline">
                        {p.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Home;
