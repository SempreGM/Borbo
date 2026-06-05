"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import productsData from "@/data/products.json";

type ProductItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

type Collection = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  is_featured: boolean;
  description: string;
  products: ProductItem[];
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"produtos" | "colecoes" | "notificacoes">("produtos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [catalogItems, setCatalogItems] = useState<Array<{ id: string; name: string; description: string; price: string; imageName: string }>>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionSlug, setCollectionSlug] = useState("");
  const [collectionImage, setCollectionImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);

  const notifications = [
    {
      id: 1,
      title: "Novo pedido recebido",
      description: "Cliente Maria Silva comprou Vestido Floral.",
      type: "order",
      timestamp: new Date(Date.now() - 3600000).toLocaleString("pt-BR"),
      details: {
        "Endereço de entrega": "Rua das Flores, 123 - Jardim Primavera, São Paulo/SP",
        CEP: "01234-567",
        Telefone: "+55 (11) 98765-4321",
        CPF: "123.456.789-00",
      },
    },
    {
      id: 2,
      title: "Mensagem de contato",
      description: "Cliente pediu informações sobre prazo de entrega.",
      type: "contact",
      timestamp: new Date(Date.now() - 7200000).toLocaleString("pt-BR"),
      details: {
        "Nome do cliente": "Ana Beatriz",
        Email: "ana.beatriz@email.com",
        Telefone: "+55 (21) 99876-5432",
      },
    },
    {
      id: 3,
      title: "Mensagem de contato",
      description: "Solicitação de atendimento pelo formulário de contato.",
      type: "contact",
      timestamp: new Date(Date.now() - 10800000).toLocaleString("pt-BR"),
      details: {
        "Nome do cliente": "Juliana Costa",
        Email: "juliana.costa@email.com",
        Telefone: "+55 (31) 91234-5678",
      },
    },
  ];

  const availableProducts = useMemo<ProductItem[]>(() =>
    productsData.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
    })),
    []
  );

  useEffect(() => {
    if (!user) {
      router.replace("/entrar");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  const handleAddCatalogItem = (event: React.FormEvent) => {
    event.preventDefault();

    if (!itemName || !description || !price) {
      return;
    }

    if (editingItemId) {
      setCatalogItems((current) =>
        current.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                name: itemName,
                description,
                price,
                imageName: image?.name ?? item.imageName,
              }
            : item
        )
      );
    } else {
      setCatalogItems((current) => [
        ...current,
        {
          id: `${Date.now()}`,
          name: itemName,
          description,
          price,
          imageName: image?.name ?? "Sem imagem",
        },
      ]);
    }

    setItemName("");
    setDescription("");
    setPrice("");
    setImage(null);
    setEditingItemId(null);
    setIsFormOpen(false);
  };

  const handleEditCatalogItem = (itemId: string) => {
    const item = catalogItems.find((product) => product.id === itemId);
    if (!item) {
      return;
    }

    setItemName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setImage(null);
    setEditingItemId(itemId);
    setIsFormOpen(true);
  };

  const handleDeleteCatalogItem = (itemId: string) => {
    setCatalogItems((current) => current.filter((item) => item.id !== itemId));
    if (editingItemId === itemId) {
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setItemName("");
    setDescription("");
    setPrice("");
    setImage(null);
    setEditingItemId(null);
    setIsFormOpen(false);
  };

  const handleEditCollection = (collectionId: string) => {
    const collection = collections.find((item) => item.id === collectionId);
    if (!collection) {
      return;
    }

    setCollectionName(collection.name);
    setCollectionDescription(collection.description);
    setCollectionSlug(collection.slug);
    setCollectionImage(collection.image_url);
    setIsFeatured(collection.is_featured);
    setSelectedProductIds(collection.products.map((product) => product.id));
    setEditingCollectionId(collectionId);
    setActiveTab("colecoes");
  };

  const handleDeleteCollection = (collectionId: string) => {
    setCollections((current) => current.filter((item) => item.id !== collectionId));
    if (editingCollectionId === collectionId) {
      handleCancelCollectionEdit();
    }
  };

  const handleCancelCollectionEdit = () => {
    setCollectionName("");
    setCollectionDescription("");
    setCollectionSlug("");
    setCollectionImage("");
    setIsFeatured(false);
    setSelectedProductIds([]);
    setEditingCollectionId(null);
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const handleCreateCollection = (event: React.FormEvent) => {
    event.preventDefault();

    if (!collectionName || selectedProductIds.length === 0) {
      return;
    }

    const selectedProducts = availableProducts.filter((product) =>
      selectedProductIds.includes(product.id)
    );

    if (editingCollectionId) {
      setCollections((current) =>
        current.map((collection) =>
          collection.id === editingCollectionId
            ? {
                ...collection,
                name: collectionName,
                slug: collectionSlug,
                image_url: collectionImage,
                is_featured: isFeatured,
                description: collectionDescription,
                products: selectedProducts,
              }
            : collection
        )
      );
    } else {
      setCollections((current) => [
        ...current,
        {
          id: `${Date.now()}`,
          name: collectionName,
          slug: collectionSlug,
          image_url: collectionImage,
          is_featured: isFeatured,
          description: collectionDescription,
          products: selectedProducts,
        },
      ]);
    }

    setCollectionName("");
    setCollectionDescription("");
    setCollectionSlug("");
    setCollectionImage("");
    setIsFeatured(false);
    setSelectedProductIds([]);
    setEditingCollectionId(null);
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel</h1>
            <p className="text-muted-foreground mt-2">
              Organize o catálogo e crie coleções com os produtos desejados.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Voltar para a loja</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant={activeTab === "produtos" ? "default" : "outline"}
            onClick={() => setActiveTab("produtos")}
          >
            Produtos
          </Button>
          <Button
            variant={activeTab === "colecoes" ? "default" : "outline"}
            onClick={() => setActiveTab("colecoes")}
          >
            Coleções
          </Button>
          <Button
            variant={activeTab === "notificacoes" ? "default" : "outline"}
            onClick={() => setActiveTab("notificacoes")}
          >
            Notificações
          </Button>
        </div>

        {activeTab === "produtos" ? (
          <div className="mt-8 space-y-8">
            {/* Seção de Produtos */}
            <div className="rounded-3xl border border-border bg-background p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Adicionar novo item</h2>
                  <p className="text-sm text-muted-foreground">
                    Preencha nome, descrição, preço e carregue uma foto do produto.
                  </p>
                </div>
                <Button variant="default" onClick={() => setIsFormOpen((value) => !value)}>
                  {isFormOpen ? "Fechar formulário" : "Adicionar item"}
                </Button>
              </div>

              {isFormOpen && (
                <form className="mt-6 space-y-6" onSubmit={handleAddCatalogItem}>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nome do item
                    </label>
                    <Input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Ex: Vestido Seda Borbô"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Descrição
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva o produto, tecido e estilo"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Valor
                      </label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="199.90"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Foto do produto
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                        className="w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-foreground"
                      />
                      {image ? (
                        <p className="text-sm text-muted-foreground mt-2">
                          Arquivo selecionado: {image.name}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" className="w-full sm:w-auto">
                      {editingItemId ? "Salvar alterações" : "Salvar item"}
                    </Button>
                    {editingItemId ? (
                      <Button variant="outline" type="button" onClick={handleCancelEdit} className="w-full sm:w-auto">
                        Cancelar edição
                      </Button>
                    ) : null}
                  </div>
                </form>
              )}
            </div>

            {catalogItems.length > 0 ? (
              <div className="rounded-3xl border border-border bg-white p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Itens adicionados</h2>
                <div className="space-y-4">
                  {catalogItems.map((product, index) => (
                    <div
                      key={`${product.name}-${index}`}
                      className="rounded-3xl border border-border bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          <p className="font-semibold text-foreground">R$ {product.price}</p>
                          <p className="text-sm text-muted-foreground">{product.imageName}</p>
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => handleEditCatalogItem(product.id)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              type="button"
                              onClick={() => handleDeleteCatalogItem(product.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-background p-6 text-sm text-muted-foreground">
                Não há itens cadastrados ainda. Abra o formulário para adicionar seu primeiro produto.
              </div>
            )}
          </div>
        ) : activeTab === "colecoes" ? (
          <div className="mt-8 space-y-8">
            {/* Seção de Coleções */}
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Coleções</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Crie coleções e adicione os produtos desejados dentro dela.
              </p>

              <form className="space-y-6" onSubmit={handleCreateCollection}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nome da coleção
                    </label>
                    <Input
                      type="text"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      placeholder="Ex: Coleção Verão 2026"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Slug (URL)
                    </label>
                    <Input
                      type="text"
                      value={collectionSlug}
                      onChange={(e) => setCollectionSlug(e.target.value)}
                      placeholder="ex: colecao-verao-2026"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    URL da Imagem de Capa
                  </label>
                  <Input
                    type="text"
                    value={collectionImage}
                    onChange={(e) => setCollectionImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-foreground">
                    Destacar esta coleção na página inicial
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Descrição da coleção
                  </label>
                  <Textarea
                    value={collectionDescription}
                    onChange={(e) => setCollectionDescription(e.target.value)}
                    placeholder="Detalhes sobre o estilo e os produtos da coleção"
                    rows={3}
                  />
                </div>

                <div className="rounded-3xl border border-border bg-white p-4">
                  <p className="text-sm font-semibold text-foreground mb-4">
                    Selecione produtos para incluir na coleção
                  </p>
                  <div className="grid gap-3 max-h-80 overflow-y-auto">
                    {availableProducts.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-3 rounded-2xl border border-border p-3 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="h-4 w-4 rounded border border-border text-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">R$ {product.price}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingCollectionId ? "Salvar alterações" : "Criar coleção"}
                  </Button>
                  {editingCollectionId ? (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleCancelCollectionEdit}
                      className="w-full sm:w-auto"
                    >
                      Cancelar edição
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>

            {collections.length > 0 ? (
              <div className="rounded-3xl border border-border bg-white p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Coleções criadas</h2>
                <div className="space-y-4">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="rounded-3xl border border-border bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{collection.name}</p>
                          <p className="text-sm text-muted-foreground">{collection.description}</p>
                          {collection.is_featured && (
                            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              Destaque na Home
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {collection.products.length} produtos
                        </p>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {collection.products.map((product) => (
                          <div
                            key={product.id}
                            className="rounded-2xl border border-border bg-white p-3"
                          >
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">R$ {product.price}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleEditCollection(collection.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-background p-6 text-sm text-muted-foreground">
                Nenhuma coleção criada ainda. Crie uma coleção e adicione produtos abaixo.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {/* Seção de Notificações */}
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Notificações</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Aqui você visualiza todas as mensagens de clientes e notificações de compras realizadas.
              </p>

              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-3xl border border-border bg-white p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                notification.type === "order"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {notification.type === "order" ? "Compra" : "Contato"}
                            </span>
                          </div>
                          <p className="font-semibold text-foreground mb-1">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mb-3">{notification.description}</p>
                          <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-border bg-slate-50 p-4 text-sm">
                        <p className="font-medium text-foreground mb-3">
                          Detalhes da {notification.type === "order" ? "compra" : "mensagem"}:
                        </p>
                        <div className="space-y-2">
                          {Object.entries(notification.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-4">
                              <span className="font-medium text-foreground">{key}:</span>
                              <span className="text-right text-muted-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Não há notificações no momento.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
