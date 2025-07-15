import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Table, Button, Modal, Form, Nav, Badge, Row, Col } from 'react-bootstrap';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { FaPlus, FaMinus, FaTrash, FaListUl } from 'react-icons/fa';

function Inventario() {
  const categorie = [
    'Colazione',
    'Panificato',
    'Scatolame',
    'Bevande',
    'No Food',
    'Freschi',
    'Surgelati',
  ];
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const focusId = searchParams.get('focus');
  const [inventario, setInventario] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    scadenza: '',
    quantita: '',
    categoria: categorie[0],
  });
  const [sortConfig, setSortConfig] = useState({ key: 'nome', direction: 'asc' });
  const [categoriaSelezionata, setCategoriaSelezionata] = useState(categorie[0]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventario'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(data);
    });
    return () => unsub();
  }, []);

  const aggiungiAListaSpesa = async (nome, quantita = 1, clicked = false) => {
    try {
      const listaRef = collection(db, 'listaSpesa');
      const q = query(listaRef, where('nome', '==', nome));
      const snapshot = await getDocs(q);
      if (clicked) {
        alert('Prodotto inserito alla lista della spesa.');
      }
      if (snapshot.empty) {
        await addDoc(listaRef, {
          nome,
          quantita,
          acquistato: false,
        });

      }
    } catch (error) {
      console.error('Errore aggiunta lista spesa:', error);
    }
  };

  const sortedInventario = [...inventario]
    .filter(p => p.categoria === categoriaSelezionata)
    .sort((a, b) => {
      let aKey = a[sortConfig.key];
      let bKey = b[sortConfig.key];

      if (sortConfig.key === 'quantita') {
        aKey = Number(aKey);
        bKey = Number(bKey);
      }

      if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleShowModal = () => {
    setFormData({ nome: '', scadenza: '', quantita: '', categoria: categoriaSelezionata });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async e => {
    e.preventDefault();

    const quant = Number(formData.quantita);
    if (!formData.nome.trim() || !formData.scadenza || quant <= 0) {
      alert('Inserisci tutti i campi correttamente.');
      return;
    }

    const nuovoProdotto = {
      nome: formData.nome.trim(),
      scadenza: formData.scadenza,
      quantita: quant,
      categoria: formData.categoria,
    };

    await addDoc(collection(db, 'inventario'), nuovoProdotto);
    setShowModal(false);
  };

  const handleRemove = async id => {
    const prodotto = inventario.find(p => p.id === id);
    if (prodotto && prodotto.quantita === 0) {
      await aggiungiAListaSpesa(prodotto.nome);
    }
    await deleteDoc(doc(db, 'inventario', id));
  };

  const handleIncrement = async (id) => {
    const prodotto = inventario.find(p => p.id === id);
    if (!prodotto) return;

    const nuovaQuantita = prodotto.quantita + 1;
    await updateDoc(doc(db, 'inventario', id), { quantita: nuovaQuantita });
  };

  const handleDecrement = async (id) => {
    const prodotto = inventario.find(p => p.id === id);
    if (!prodotto) return;

    const nuovaQuantita = prodotto.quantita - 1;

    if (nuovaQuantita <= 0) {
      await aggiungiAListaSpesa(prodotto.nome);
      await deleteDoc(doc(db, 'inventario', id));
    } else {
      await updateDoc(doc(db, 'inventario', id), { quantita: nuovaQuantita });
    }
  };

  // Funzione helper per badge scadenza
  const renderScadenzaBadge = (dateStr) => {
    const today = new Date();
    const scadenza = new Date(dateStr);
    const diff = (scadenza - today) / (1000 * 3600 * 24);

    if (diff < 0) return <Badge bg="danger">Scaduto</Badge>;
    if (diff <= 1) return <Badge bg="warning" text="dark">Quasi scaduto</Badge>;
    return <>{dateStr}</>;
  };

  return (
    <Container className="my-4">
      <h1 className="mb-4 text-center">📦 Inventario Prodotti</h1>

      <Nav
        variant="tabs"
        activeKey={categoriaSelezionata}
        onSelect={setCategoriaSelezionata}
        className="mb-3 overflow-auto"
        style={{ whiteSpace: 'nowrap' }}
      >
        {categorie.map(cat => (
          <Nav.Item key={cat}>
            <Nav.Link eventKey={cat}>{cat}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
        <Button variant="primary" onClick={handleShowModal} className="flex-grow-1 flex-md-grow-0" style={{ minWidth: 150 }}>
          <FaPlus className="me-2" /> Aggiungi prodotto
        </Button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table bordered hover responsive="sm" className="align-middle text-center">
          <thead className="table-light">
            <tr>
              <th onClick={() => requestSort('nome')} style={{ cursor: 'pointer', minWidth: 120 }}>
                Nome {sortConfig.key === 'nome' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('scadenza')} style={{ cursor: 'pointer', minWidth: 110 }}>
                Scadenza {sortConfig.key === 'scadenza' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => requestSort('quantita')} style={{ cursor: 'pointer', minWidth: 90 }}>
                Quantità {sortConfig.key === 'quantita' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ minWidth: 100 }}>Categoria</th>
              <th style={{ minWidth: 230 }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {sortedInventario.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  Nessun prodotto nella categoria selezionata.
                </td>
              </tr>
            ) : (
              sortedInventario.map(({ id, nome, scadenza, quantita, categoria }) => (
                <tr
                  key={id}
                  ref={el => {
                    if (id === focusId && el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className={id === focusId ? 'table-warning' : ''}
                >
                  <td className="text-start">{nome}</td>
                  <td>{renderScadenzaBadge(scadenza)}</td>
                  <td>{quantita}</td>
                  <td>{categoria}</td>
                  <td className="d-flex justify-content-center flex-wrap gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleDecrement(id)} title="Riduci quantità">
                      <FaMinus />
                    </Button>
                    <Button variant="success" size="sm" onClick={() => handleIncrement(id)} title="Aumenta quantità">
                      <FaPlus />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleRemove(id)} title="Elimina prodotto">
                      <FaTrash />
                    </Button>
                    <Button variant="info" size="sm" onClick={() => aggiungiAListaSpesa(nome, quantita, true)} title="Aggiungi a lista spesa">
                      <FaListUl />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Aggiungi nuovo prodotto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAdd}>
          <Modal.Body>
            <Row>
              <Col xs={12} md={8}>
                <Form.Group className="mb-3" controlId="nome">
                  <Form.Label>Nome prodotto</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    placeholder="Inserisci nome prodotto"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group className="mb-3" controlId="quantita">
                  <Form.Label>Quantità</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantita"
                    min="1"
                    placeholder="1"
                    value={formData.quantita}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3" controlId="scadenza">
                  <Form.Label>Data di scadenza</Form.Label>
                  <Form.Control
                    type="date"
                    name="scadenza"
                    value={formData.scadenza}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3" controlId="categoria">
                  <Form.Label>Categoria</Form.Label>
                  <Form.Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    {categorie.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="justify-content-between">
            <Button variant="secondary" onClick={handleCloseModal}>
              Annulla
            </Button>
            <Button variant="primary" type="submit">
              Aggiungi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Inventario;
