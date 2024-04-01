import React, { useState } from 'react';
import './navbar.css';

export default function Navbar() {
    const [modalOpen, setModalOpen] = useState(false);

    const handleModal = () => {
        setModalOpen(!modalOpen);
    };

    return (
        <>
            <nav className="navbar">
                <div className='nav-top'>
                    <form>
                        <label htmlFor="pesquisa">Pesquisa:</label>
                        <input type="text" id="pesquisa" className="pesquisa" placeholder="Pesquisar..." />
                    </form>
                    <img src="/cart.svg" alt="cart" id='cart' onClick={handleModal} />
                </div>
                <div className="nav-bot">
                    <ul>
                        <li><a href="#">home</a></li>
                        <li><a href="#Conjunto">Conjuntos</a></li>
                        <li><a href="#Moda-Intima">Moda Intima</a></li>
                        <li><a href="#Moda-Confort">Moda Confort</a></li>
                        <li><a href="#Novidades">Novidades</a></li>
                    </ul>
                </div>
            </nav>
            {modalOpen && (
                <div className="modal">
                    <h1>Carrinho</h1>
                    <div className="modal-content">
                        <span className="close" onClick={handleModal}>&times;</span>
                        {/* Conteúdo do seu modal aqui */}
                        <p>Este é o conteúdo do modal</p>
                    </div>
                </div>
            )}
        </>
    );
}
