import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Row, Col, Badge } from 'react-bootstrap';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';

function ListaSpesa() {
  const [prodotti, setProdotti] = useState([]);
  const [nome, setNome] = useState('');
  const [quantita, setQuantita] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'listaSpesa'), snapshot => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProdotti(items);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    const nomeTrim = nome.trim();
    const quantitaNum = Number(quantita);

    if (nomeTrim === '' || !quantitaNum || quantitaNum <= 0) {
      alert('Inserisci un nome valido e una quantità positiva');
      return;
    }

    try {
      await addDoc(collection(db, 'listaSpesa'), {
        nome: nomeTrim,
        quantita: quantitaNum,
        acquistato: false,
      });
      setNome('');
      setQuantita('');
    } catch (error) {
      console.error("Errore aggiunta:", error);
    }
  };

  const toggleAcquistato = async id => {
    const prodotto = prodotti.find(p => p.id === id);
    if (!prodotto) return;

    try {
      await updateDoc(doc(db, 'listaSpesa', id), {
        acquistato: !prodotto.acquistato
      });
    } catch (error) {
      console.error("Errore aggiornamento:", error);
    }
  };

  const handleRemove = async id => {
    try {
      await deleteDoc(doc(db, 'listaSpesa', id));
    } catch (error) {
      console.error("Errore eliminazione:", error);
    }
  };

  const daAcquistare = prodotti.filter(p => !p.acquistato);
  const acquistati = prodotti.filter(p => p.acquistato);

  return (
    <div>
      <h1 className="mb-4 text-center">🛒 Lista della Spesa</h1>

      <Form onSubmit={handleAdd} className="mb-5">
        <Row className="g-2 justify-content-center">
          <Col xs={12} sm={7} md={6}>
            <Form.Control
              type="text"
              placeholder="Nome prodotto"
              value={nome}
              onChange={e => setNome(e.target.value)}
              aria-label="Nome prodotto"
            />
          </Col>
          <Col xs={6} sm={3} md={2}>
            <Form.Control
              type="number"
              min="1"
              placeholder="Quantità"
              value={quantita}
              onChange={e => setQuantita(e.target.value)}
              aria-label="Quantità prodotto"
            />
          </Col>
          <Col xs={6} sm={2} md={2}>
            <Button variant="primary" type="submit" className="w-100" aria-label="Aggiungi prodotto">
              + Aggiungi
            </Button>
          </Col>
        </Row>
      </Form>

      <section className="mb-5">
        <h3 className="mb-3">
          Da acquistare{' '}
          <Badge bg="warning" pill>{daAcquistare.length}</Badge>
        </h3>
        {daAcquistare.length === 0 ? (
          <p className="text-muted fst-italic">Nessun prodotto da acquistare.</p>
        ) : (
          <Table bordered hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Nome prodotto</th>
                <th style={{width: '100px'}}>Quantità</th>
                <th style={{width: '130px'}}>Stato</th>
                <th style={{width: '110px'}}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {daAcquistare.map(({ id, nome, quantita }) => (
                <tr key={id}>
                  <td>{nome}</td>
                  <td>{quantita}</td>
                  <td>
                    <Badge bg="secondary" className="text-uppercase">Da acquistare</Badge>
                  </td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => toggleAcquistato(id)}
                      className="me-2"
                      aria-label={`Segna ${nome} come acquistato`}
                    >
                      ✔️
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(id)}
                      aria-label={`Elimina ${nome}`}
                    >
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section>
        <h3 className="mb-3">
          Acquistati{' '}
          <Badge bg="success" pill>{acquistati.length}</Badge>
        </h3>
        {acquistati.length === 0 ? (
          <p className="text-muted fst-italic">Nessun prodotto acquistato.</p>
        ) : (
          <Table bordered hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Nome prodotto</th>
                <th style={{width: '100px'}}>Quantità</th>
                <th style={{width: '130px'}}>Stato</th>
                <th style={{width: '110px'}}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {acquistati.map(({ id, nome, quantita }) => (
                <tr key={id}>
                  <td>{nome}</td>
                  <td>{quantita}</td>
                  <td>
                    <Badge bg="success" className="text-uppercase">Acquistato</Badge>
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => toggleAcquistato(id)}
                      className="me-2"
                      aria-label={`Segna ${nome} come non acquistato`}
                    >
                      ↩️
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(id)}
                      aria-label={`Elimina ${nome}`}
                    >
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

export default ListaSpesa;
