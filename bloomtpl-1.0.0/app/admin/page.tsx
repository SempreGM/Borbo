"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultHeroBannerSettings,
  HERO_BANNER_STORAGE_KEY,
  HeroBannerSettings,
  MAX_SITE_IMAGE_UPLOAD_SIZE_BYTES,
  MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL,
  normalizeHeroBannerSettings,
} from "@/lib/heroBanner";
import {
  defaultFooterSettings,
  FOOTER_SETTINGS_STORAGE_KEY,
  FooterSettings,
  normalizeFooterSettings,
} from "@/lib/footerSettings";
import {
  defaultShippingSettings,
  normalizeShippingSettings,
  SHIPPING_SETTINGS_STORAGE_KEY,
  ShippingSettings,
} from "@/lib/shippingSettings";
import {
  getFooterSettings,
  getHeroBannerSettings,
  getShippingSettings,
  saveFooterSettings,
  saveHeroBannerSettings,
  saveShippingSettings,
} from "@/services/settings";
import {
  createProduct,
  deleteProduct,
  listAdminProducts,
  listAdminProductVariants,
  listAdminProductVariantsByProductIds,
  saveProductVariants,
  updateProduct,
  type ProductRecord,
  type SaveProductVariantInput,
} from "@/services/products";
import {
  listAdminOrders,
  updateOrderStatus,
  type OrderItemRecord,
  type OrderRecord,
} from "@/services/orders";
import { listProfiles, type ProfileRecord } from "@/services/profiles";
import {
  createCollection,
  deleteCollection,
  listCollections,
  updateCollection,
  type CollectionWithProducts,
} from "@/services/collections";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  type CouponRecord,
} from "@/services/coupons";
import { PRODUCT_IMAGES_BUCKET, uploadImage } from "@/services/storage";
import type { CouponDiscountType, Json, OrderStatus } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

type ProductItem = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  description: string;
};

type ProductVariantFormRow = SaveProductVariantInput & {
  localId: string;
  imageFile: File | null;
};

type AdminOrder = OrderRecord & {
  order_items?: OrderItemRecord[];
};

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message);
  }

  return "";
}

const orderStatusLabels: Record<OrderStatus, string> = {
  received: "Recebido",
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  processing: "Em preparo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const paymentMethodLabels = {
  pix: "Pix",
  card: "Cartão",
  transfer: "Transferência",
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"produtos" | "colecoes" | "clientes" | "cupons" | "frete" | "banner" | "rodape" | "notificacoes">("produtos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [stock, setStock] = useState("0");
  const [productIsFeatured, setProductIsFeatured] = useState(false);
  const [productVariants, setProductVariants] = useState<ProductVariantFormRow[]>([]);
  const [productColorsById, setProductColorsById] = useState<Record<string, string[]>>({});
  const [image, setImage] = useState<File | null>(null);
  const [catalogItems, setCatalogItems] = useState<ProductRecord[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFeedback, setProductFeedback] = useState("");
  const [productError, setProductError] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionSlug, setCollectionSlug] = useState("");
  const [collectionImage, setCollectionImage] = useState("");
  const [collectionHighlightLabel, setCollectionHighlightLabel] = useState("Destaque da semana");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Array<string | number>>([]);
  const [collections, setCollections] = useState<CollectionWithProducts[]>([]);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [isSavingCollection, setIsSavingCollection] = useState(false);
  const [collectionFeedback, setCollectionFeedback] = useState("");
  const [collectionError, setCollectionError] = useState("");
  const [bannerSettings, setBannerSettings] = useState<HeroBannerSettings>(defaultHeroBannerSettings);
  const [bannerImagesText, setBannerImagesText] = useState(defaultHeroBannerSettings.imageUrls.join("\n"));
  const [bannerSaved, setBannerSaved] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [footerSaved, setFooterSaved] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(defaultShippingSettings);
  const [shippingSaved, setShippingSaved] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [ordersFeedback, setOrdersFeedback] = useState("");
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState("");
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState<CouponDiscountType>("percentage");
  const [couponDiscountValue, setCouponDiscountValue] = useState("");
  const [couponMinPurchase, setCouponMinPurchase] = useState("");
  const [couponActive, setCouponActive] = useState(true);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState("");
  const [couponError, setCouponError] = useState("");

  const availableProducts = useMemo<ProductItem[]>(() => {
    return catalogItems
      .filter((product) => product.is_active)
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? "/images/NoImage.jpg",
        description: product.description,
      }));
  }, [catalogItems]);

  const formatShippingAddress = (address: Json) => {
    if (!address || typeof address !== "object" || Array.isArray(address)) {
      return "Endereço não informado";
    }

    const shippingAddress = address as Record<string, string | undefined>;
    return [
      shippingAddress.street,
      shippingAddress.number,
      shippingAddress.complement,
      shippingAddress.neighborhood,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zipCode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  useEffect(() => {
    if (!user) {
      router.replace("/entrar");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    getHeroBannerSettings()
      .then((settings) => {
        setBannerSettings(settings);
        setBannerImagesText(settings.imageUrls.join("\n"));
      })
      .catch(() => {
        const savedBanner = localStorage.getItem(HERO_BANNER_STORAGE_KEY);

        if (!savedBanner) {
          return;
        }

        try {
          const parsedBanner = normalizeHeroBannerSettings(
            JSON.parse(savedBanner) as HeroBannerSettings
          );
          setBannerSettings(parsedBanner);
          setBannerImagesText(parsedBanner.imageUrls.join("\n"));
        } catch {
          localStorage.removeItem(HERO_BANNER_STORAGE_KEY);
        }
      });
  }, []);

  useEffect(() => {
    getFooterSettings()
      .then(setFooterSettings)
      .catch(() => {
        const savedFooter = localStorage.getItem(FOOTER_SETTINGS_STORAGE_KEY);

        if (!savedFooter) {
          return;
        }

        try {
          setFooterSettings(
            normalizeFooterSettings(JSON.parse(savedFooter) as FooterSettings)
          );
        } catch {
          localStorage.removeItem(FOOTER_SETTINGS_STORAGE_KEY);
        }
      });
  }, []);

  useEffect(() => {
    getShippingSettings()
      .then(setShippingSettings)
      .catch(() => {
        const savedShipping = localStorage.getItem(SHIPPING_SETTINGS_STORAGE_KEY);

        if (!savedShipping) {
          return;
        }

        try {
          setShippingSettings(
            normalizeShippingSettings(JSON.parse(savedShipping) as ShippingSettings)
          );
        } catch {
          localStorage.removeItem(SHIPPING_SETTINGS_STORAGE_KEY);
        }
      });
  }, []);

  const createSlug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const resetProductForm = () => {
    setItemName("");
    setDescription("");
    setPrice("");
    setCategoryName("");
    setStock("0");
    setProductIsFeatured(false);
    setProductVariants([]);
    setImage(null);
    setEditingItemId(null);
    setIsFormOpen(false);
  };

  const loadProducts = async () => {
    try {
      const products = await listAdminProducts();
      setCatalogItems(products);
      setProductError("");

      const productIds = products.map((product) => product.id);
      const variants = await listAdminProductVariantsByProductIds(productIds);
      const colorsById = variants.reduce<Record<string, string[]>>(
        (acc, variant) => {
          if (!variant.active || !variant.color) {
            return acc;
          }

          const currentColors = acc[variant.product_id] ?? [];

          if (!currentColors.includes(variant.color)) {
            acc[variant.product_id] = [...currentColors, variant.color];
          }

          return acc;
        },
        {}
      );
      setProductColorsById(colorsById);
    } catch {
      setProductError(
        "Não foi possível carregar os produtos. Confira a configuração do Supabase."
      );
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      void loadProducts();
    }
  }, [user]);

  const loadCollections = async () => {
    try {
      const savedCollections = await listCollections();
      setCollections(savedCollections);
      setCollectionError("");
    } catch {
      setCollectionError(
        "Não foi possível carregar as coleções. Confira se as tabelas foram criadas no Supabase."
      );
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      void loadCollections();
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError("");

    try {
      const adminOrders = await listAdminOrders();
      setOrders(adminOrders as AdminOrder[]);
    } catch {
      setOrdersError(
        "Não foi possível carregar os pedidos. Confira o acesso admin no Supabase."
      );
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      void loadOrders();
    }
  }, [user]);

  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    setProfilesError("");

    try {
      const savedProfiles = await listProfiles();
      setProfiles(savedProfiles);
    } catch {
      setProfilesError(
        "Não foi possível carregar os clientes. Confira o acesso admin no Supabase."
      );
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      void loadProfiles();
    }
  }, [user]);

  const resetCouponForm = () => {
    setCouponCode("");
    setCouponDescription("");
    setCouponDiscountType("percentage");
    setCouponDiscountValue("");
    setCouponMinPurchase("");
    setCouponActive(true);
    setEditingCouponId(null);
    setCouponError("");
    setCouponFeedback("");
  };

  const loadCoupons = async () => {
    setIsLoadingCoupons(true);
    setCouponError("");

    try {
      const savedCoupons = await listCoupons();
      setCoupons(savedCoupons);
    } catch {
      setCouponError(
        "Não foi possível carregar os cupons. Confira se a tabela coupons foi criada no Supabase."
      );
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      void loadCoupons();
    }
  }, [user]);

  const handleEditCoupon = (couponId: string) => {
    const coupon = coupons.find((item) => item.id === couponId);

    if (!coupon) {
      return;
    }

    setCouponCode(coupon.code);
    setCouponDescription(coupon.description ?? "");
    setCouponDiscountType(coupon.discount_type);
    setCouponDiscountValue(String(coupon.discount_value));
    setCouponMinPurchase(String(coupon.min_purchase));
    setCouponActive(coupon.active);
    setEditingCouponId(coupon.id);
    setCouponError("");
    setCouponFeedback("");
    setActiveTab("cupons");
  };

  const handleSaveCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setCouponError("");
    setCouponFeedback("");

    const discountValue = Number(couponDiscountValue);
    const minPurchase = Number(couponMinPurchase || 0);

    if (!couponCode.trim()) {
      setCouponError("Informe o código do cupom.");
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setCouponError("Informe um desconto maior que zero.");
      return;
    }

    if (couponDiscountType === "percentage" && discountValue > 100) {
      setCouponError("Cupom por porcentagem deve ser de no máximo 100%.");
      return;
    }

    if (!Number.isFinite(minPurchase) || minPurchase < 0) {
      setCouponError("Informe uma compra mínima válida.");
      return;
    }

    setIsSavingCoupon(true);

    try {
      const payload = {
        code: couponCode,
        description: couponDescription.trim() || null,
        discountType: couponDiscountType,
        discountValue,
        minPurchase,
        active: couponActive,
      };

      if (editingCouponId) {
        await updateCoupon(editingCouponId, payload);
        resetCouponForm();
        setCouponFeedback("Cupom atualizado com sucesso.");
      } else {
        await createCoupon(payload);
        resetCouponForm();
        setCouponFeedback("Cupom criado com sucesso.");
      }

      const savedCoupons = await listCoupons();
      setCoupons(savedCoupons);
    } catch {
      setCouponError("Não foi possível salvar o cupom. Verifique se o código já existe.");
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleDisableCoupon = async (couponId: string) => {
    setCouponError("");
    setCouponFeedback("");

    try {
      await deleteCoupon(couponId);
      const savedCoupons = await listCoupons();
      setCoupons(savedCoupons);
      setCouponFeedback("Cupom desativado.");

      if (editingCouponId === couponId) {
        resetCouponForm();
        setCouponFeedback("Cupom desativado.");
      }
    } catch {
      setCouponError("Não foi possível desativar o cupom.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrdersError("");
    setOrdersFeedback("");

    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
      setOrdersFeedback(
        "Status do pedido atualizado. O cliente verá essa atualização na conta."
      );
    } catch {
      setOrdersError("Não foi possível atualizar o status do pedido.");
    }
  };

  const handleProductImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setProductError("");

    if (selectedFile && selectedFile.size > MAX_SITE_IMAGE_UPLOAD_SIZE_BYTES) {
      setProductError(
        `A imagem "${selectedFile.name}" ultrapassa o limite de ${MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL}.`
      );
      event.target.value = "";
      setImage(null);
      return;
    }

    setImage(selectedFile);
  };

  const handleAddProductVariant = () => {
    setProductVariants((current) => [
      ...current,
      {
        localId: `variant-${Date.now()}`,
        color: "",
        imageUrl: null,
        imageFile: null,
        stock: 0,
        active: true,
      },
    ]);
  };

  const handleProductVariantChange = (
    localId: string,
    field: keyof SaveProductVariantInput | "imageFile",
    value: string | boolean | File | null
  ) => {
    setProductVariants((current) =>
      current.map((variant) =>
        variant.localId === localId
          ? {
              ...variant,
              [field]:
                field === "stock"
                  ? Math.max(0, Number(value) || 0)
                  : value,
            }
          : variant
      )
    );
  };

  const handleRemoveProductVariant = (localId: string) => {
    setProductVariants((current) =>
      current.filter((variant) => variant.localId !== localId)
    );
  };

  const handleAddCatalogItem = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsedPrice = Number(price);

    if (!itemName.trim()) {
      setProductError("Informe o nome do produto antes de salvar.");
      return;
    }

    if (!description.trim()) {
      setProductError("Informe a descrição do produto antes de salvar.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setProductError("Informe um valor válido maior que zero.");
      return;
    }

    setIsSavingProduct(true);
    setProductError("");
    setProductFeedback("");

    try {
      const currentProduct = editingItemId
        ? catalogItems.find((product) => product.id === editingItemId)
        : null;
      const uploadedImageUrl = image
        ? await uploadImage(image, PRODUCT_IMAGES_BUCKET)
        : undefined;
      const productImages = uploadedImageUrl
        ? [uploadedImageUrl]
        : currentProduct?.images ?? [];
      const filledVariants = productVariants.filter(
        (variant) => variant.color.trim() || variant.imageUrl || variant.imageFile
      );
      const variantsMissingColor = filledVariants.some(
        (variant) => !variant.color.trim()
      );
      const variantsMissingImage = filledVariants.some(
        (variant) => !variant.imageUrl && !variant.imageFile
      );

      if (variantsMissingColor) {
        setProductError("Toda cor cadastrada precisa ter nome.");
        return;
      }

      if (variantsMissingImage) {
        setProductError("Toda cor cadastrada precisa ter uma foto de referência.");
        return;
      }

      const preparedVariants = await Promise.all(
        filledVariants.map(async (variant) => ({
          color: variant.color,
          imageUrl: variant.imageFile
            ? await uploadImage(variant.imageFile, PRODUCT_IMAGES_BUCKET)
            : variant.imageUrl,
          stock: variant.stock,
          active: variant.active,
        }))
      );
      const activeVariantStock = preparedVariants
        .filter((variant) => variant.active && variant.color.trim() && variant.imageUrl)
        .reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);

      const payload = {
        name: itemName,
        slug: createSlug(itemName),
        description,
        price: parsedPrice,
        category_name: categoryName.trim() || null,
        images: productImages,
        stock: filledVariants.length > 0 ? activeVariantStock : Number(stock) || 0,
        is_featured: productIsFeatured,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (editingItemId) {
        await updateProduct(editingItemId, payload);
        await saveProductVariants(editingItemId, preparedVariants);
        setProductFeedback("Produto atualizado com sucesso.");
      } else {
        const createdProduct = await createProduct(payload);
        await saveProductVariants(createdProduct.id, preparedVariants);
        setProductFeedback("Produto cadastrado com sucesso.");
      }

      await loadProducts();
      resetProductForm();
    } catch (error) {
      const errorMessage = getReadableErrorMessage(error);
      const lowerErrorMessage = errorMessage.toLowerCase();

      if (
        lowerErrorMessage.includes("image_url") ||
        lowerErrorMessage.includes("schema cache")
      ) {
        setProductError(
          "Não foi possível salvar as cores porque a coluna image_url ainda não existe no Supabase. Rode: alter table public.product_variants add column if not exists image_url text;"
        );
      } else if (lowerErrorMessage.includes("product_variants")) {
        setProductError(
          `Não foi possível salvar as cores na tabela product_variants. Detalhe: ${errorMessage}`
        );
      } else if (
        lowerErrorMessage.includes("storage") ||
        lowerErrorMessage.includes("bucket")
      ) {
        setProductError(
          `Não foi possível enviar a foto da cor para o Storage. Detalhe: ${errorMessage}`
        );
      } else {
        setProductError(
          errorMessage
            ? `Não foi possível salvar o produto. Detalhe: ${errorMessage}`
            : "Não foi possível salvar o produto. Confira se você está logado como admin no Supabase."
        );
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleEditCatalogItem = async (itemId: string) => {
    const item = catalogItems.find((product) => product.id === itemId);
    if (!item) {
      return;
    }

    setItemName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setCategoryName(item.category_name ?? "");
    setStock(String(item.stock));
    setProductIsFeatured(item.is_featured);
    setImage(null);
    setEditingItemId(itemId);
    setProductError("");
    setProductFeedback("");
    setIsFormOpen(true);

    try {
      const variants = await listAdminProductVariants(itemId);
      setProductVariants(
        variants.map((variant) => ({
          localId: variant.id,
          color: variant.color,
          imageUrl: variant.image_url,
          imageFile: null,
          stock: variant.stock,
          active: variant.active,
        }))
      );
    } catch {
      setProductVariants([]);
    }
  };

  const handleDeleteCatalogItem = async (itemId: string) => {
    setProductError("");
    setProductFeedback("");

    try {
      await deleteProduct(itemId);
      await loadProducts();
      setProductFeedback("Produto removido da loja.");
      if (editingItemId === itemId) {
        handleCancelEdit();
      }
    } catch {
      setProductError("Não foi possível excluir o produto.");
    }
  };

  const handleCancelEdit = () => {
    resetProductForm();
    setProductError("");
    setProductFeedback("");
  };

  const handleEditCollection = (collectionId: string) => {
    const collection = collections.find((item) => item.id === collectionId);
    if (!collection) {
      return;
    }

    setCollectionName(collection.name);
    setCollectionDescription(collection.description ?? "");
    setCollectionSlug(collection.slug);
    setCollectionImage(collection.image_url ?? "");
    setCollectionHighlightLabel(collection.highlight_label ?? "Destaque da semana");
    setIsFeatured(collection.is_featured);
    setSelectedProductIds(collection.products.map((product) => product.id));
    setEditingCollectionId(collectionId);
    setActiveTab("colecoes");
  };

  const handleDeleteCollection = async (collectionId: string) => {
    setCollectionError("");
    setCollectionFeedback("");

    try {
      await deleteCollection(collectionId);
      const savedCollections = await listCollections();
      setCollections(savedCollections);
      setCollectionFeedback("Coleção removida com sucesso.");
      if (editingCollectionId === collectionId) {
        handleCancelCollectionEdit();
      }
    } catch {
      setCollectionError("Não foi possível remover a coleção.");
    }
  };

  const handleCancelCollectionEdit = () => {
    setCollectionName("");
    setCollectionDescription("");
    setCollectionSlug("");
    setCollectionImage("");
    setCollectionHighlightLabel("Destaque da semana");
    setIsFeatured(false);
    setSelectedProductIds([]);
    setEditingCollectionId(null);
    setCollectionError("");
    setCollectionFeedback("");
  };

  const toggleProductSelection = (productId: string | number) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const handleCreateCollection = async (event: React.FormEvent) => {
    event.preventDefault();
    setCollectionError("");
    setCollectionFeedback("");

    if (!collectionName || selectedProductIds.length === 0) {
      setCollectionError("Informe o nome da coleção e selecione pelo menos um produto.");
      return;
    }

    const productIds = selectedProductIds.filter(
      (productId): productId is string => typeof productId === "string"
    );

    if (productIds.length === 0) {
      setCollectionError("Selecione produtos cadastrados no Supabase para salvar a coleção.");
      return;
    }

    const payload = {
      name: collectionName,
      slug: collectionSlug || createSlug(collectionName),
      imageUrl: collectionImage || null,
      highlightLabel: collectionHighlightLabel || "Destaque da semana",
      isFeatured,
      description: collectionDescription || null,
      productIds,
    };

    setIsSavingCollection(true);

    try {
      if (editingCollectionId) {
        await updateCollection(editingCollectionId, payload);
        setCollectionFeedback("Coleção atualizada com sucesso.");
      } else {
        await createCollection(payload);
        setCollectionFeedback("Coleção criada com sucesso.");
      }

      const savedCollections = await listCollections();
      setCollections(savedCollections);
      setCollectionName("");
      setCollectionDescription("");
      setCollectionSlug("");
      setCollectionImage("");
      setCollectionHighlightLabel("Destaque da semana");
      setIsFeatured(false);
      setSelectedProductIds([]);
      setEditingCollectionId(null);
    } catch {
      setCollectionError("Não foi possível salvar a coleção no Supabase.");
    } finally {
      setIsSavingCollection(false);
    }
  };

  const handleBannerFieldChange = (
    field: keyof Omit<HeroBannerSettings, "imageUrls">,
    value: string
  ) => {
    setBannerSettings((current) => ({
      ...current,
      [field]: value,
    }));
    setBannerSaved(false);
  };

  const readImageAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleBannerImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_SITE_IMAGE_UPLOAD_SIZE_BYTES
    );

    if (oversizedFile) {
      setBannerUploadError(
        `A imagem "${oversizedFile.name}" ultrapassa o limite de ${MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL}.`
      );
      return;
    }

    const currentImages = bannerImagesText
      .split("\n")
      .map((imageUrl) => imageUrl.trim())
      .filter(Boolean);

    const availableSlots = Math.max(0, 5 - currentImages.length);

    if (availableSlots === 0) {
      setBannerUploadError("O banner aceita no máximo 5 imagens.");
      return;
    }

    try {
      const uploadedImages = await Promise.all(
        files.slice(0, availableSlots).map(async (file) => {
          try {
            return await uploadImage(file);
          } catch {
            return readImageAsDataUrl(file);
          }
        })
      );
      const nextImages = [...currentImages, ...uploadedImages].slice(0, 5);

      setBannerImagesText(nextImages.join("\n"));
      setBannerUploadError("");
      setBannerSaved(false);
    } catch {
      setBannerUploadError("Não foi possível carregar uma das imagens selecionadas.");
    }
  };

  const handleRemoveBannerImage = (imageIndex: number) => {
    const nextImages = bannerImagesText
      .split("\n")
      .map((imageUrl) => imageUrl.trim())
      .filter(Boolean)
      .filter((_, index) => index !== imageIndex);

    setBannerImagesText(nextImages.join("\n"));
    setBannerUploadError("");
    setBannerSaved(false);
  };

  const handleSaveBanner = async (event: React.FormEvent) => {
    event.preventDefault();

    const updatedBanner = normalizeHeroBannerSettings({
      ...bannerSettings,
      imageUrls: bannerImagesText
        .split("\n")
        .map((imageUrl) => imageUrl.trim())
        .filter(Boolean),
    });

    try {
      await saveHeroBannerSettings(updatedBanner);
      localStorage.removeItem(HERO_BANNER_STORAGE_KEY);
    } catch {
      localStorage.setItem(HERO_BANNER_STORAGE_KEY, JSON.stringify(updatedBanner));
    }

    setBannerSettings(updatedBanner);
    setBannerImagesText(updatedBanner.imageUrls.join("\n"));
    setBannerUploadError("");
    setBannerSaved(true);
  };

  const handleResetBanner = () => {
    localStorage.removeItem(HERO_BANNER_STORAGE_KEY);
    void saveHeroBannerSettings(defaultHeroBannerSettings).catch(() => undefined);
    setBannerSettings(defaultHeroBannerSettings);
    setBannerImagesText(defaultHeroBannerSettings.imageUrls.join("\n"));
    setBannerUploadError("");
    setBannerSaved(false);
  };

  const handleFooterFieldChange = (
    field: keyof FooterSettings,
    value: string
  ) => {
    setFooterSettings((current) => ({
      ...current,
      [field]: value,
    }));
    setFooterSaved(false);
  };

  const handleSaveFooter = async (event: React.FormEvent) => {
    event.preventDefault();

    const updatedFooter = normalizeFooterSettings(footerSettings);

    try {
      await saveFooterSettings(updatedFooter);
      localStorage.removeItem(FOOTER_SETTINGS_STORAGE_KEY);
    } catch {
      localStorage.setItem(FOOTER_SETTINGS_STORAGE_KEY, JSON.stringify(updatedFooter));
    }

    setFooterSettings(updatedFooter);
    setFooterSaved(true);
  };

  const handleResetFooter = () => {
    localStorage.removeItem(FOOTER_SETTINGS_STORAGE_KEY);
    void saveFooterSettings(defaultFooterSettings).catch(() => undefined);
    setFooterSettings(defaultFooterSettings);
    setFooterSaved(false);
  };

  const handleShippingFieldChange = (
    field: keyof ShippingSettings,
    value: string | boolean
  ) => {
    setShippingSettings((current) => ({
      ...current,
      [field]:
        typeof value === "boolean"
          ? value
          : field === "deliveryEstimate"
            ? value
            : Number(value),
    }));
    setShippingSaved(false);
  };

  const handleSaveShipping = async (event: React.FormEvent) => {
    event.preventDefault();

    const updatedShipping = normalizeShippingSettings(shippingSettings);

    try {
      await saveShippingSettings(updatedShipping);
      localStorage.removeItem(SHIPPING_SETTINGS_STORAGE_KEY);
    } catch {
      localStorage.setItem(
        SHIPPING_SETTINGS_STORAGE_KEY,
        JSON.stringify(updatedShipping)
      );
    }

    setShippingSettings(updatedShipping);
    setShippingSaved(true);
  };

  const handleResetShipping = () => {
    localStorage.removeItem(SHIPPING_SETTINGS_STORAGE_KEY);
    void saveShippingSettings(defaultShippingSettings).catch(() => undefined);
    setShippingSettings(defaultShippingSettings);
    setShippingSaved(false);
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
            variant={activeTab === "clientes" ? "default" : "outline"}
            onClick={() => setActiveTab("clientes")}
          >
            Clientes
          </Button>
          <Button
            variant={activeTab === "cupons" ? "default" : "outline"}
            onClick={() => setActiveTab("cupons")}
          >
            Cupons
          </Button>
          <Button
            variant={activeTab === "frete" ? "default" : "outline"}
            onClick={() => setActiveTab("frete")}
          >
            Frete
          </Button>
          <Button
            variant={activeTab === "banner" ? "default" : "outline"}
            onClick={() => setActiveTab("banner")}
          >
            Banner
          </Button>
          <Button
            variant={activeTab === "rodape" ? "default" : "outline"}
            onClick={() => setActiveTab("rodape")}
          >
            Rodapé
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
                  <h2 className="text-lg font-semibold text-foreground">
                    {editingItemId ? "Editar produto" : "Adicionar novo item"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Cadastre produtos no Supabase com foto, categoria, estoque e destaque.
                  </p>
                </div>
                <Button variant="default" onClick={() => setIsFormOpen((value) => !value)}>
                  {isFormOpen ? "Fechar formulário" : "Adicionar item"}
                </Button>
              </div>

              {productError ? (
                <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {productError}
                </div>
              ) : null}
              {productFeedback ? (
                <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
                  {productFeedback}
                </div>
              ) : null}

              {isFormOpen && (
                <form className="mt-6 space-y-6" onSubmit={handleAddCatalogItem} noValidate>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nome do item
                    </label>
                    <Input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Ex: Vestido Seda borbô"
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
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Categoria
                      </label>
                      <Input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Ex: Vestidos"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Estoque
                      </label>
                      <Input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Se houver variações, o estoque será calculado pela soma delas.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Cores do produto
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cadastre cor, estoque e uma foto de referência obrigatória.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddProductVariant}
                        >
                          Adicionar cor
                        </Button>
                      </div>

                      {productVariants.length > 0 ? (
                        <div className="space-y-3">
                          {productVariants.map((variant) => (
                            <div
                              key={variant.localId}
                              className="grid gap-3 rounded-2xl border border-border bg-white p-3 md:grid-cols-[minmax(140px,1fr)_minmax(220px,1.35fr)_120px_110px_auto] md:items-start"
                            >
                              <div>
                                <label className="mb-2 block text-xs font-medium text-foreground">
                                  Cor
                                </label>
                                <Input
                                  className="h-10"
                                  value={variant.color}
                                  onChange={(event) =>
                                    handleProductVariantChange(
                                      variant.localId,
                                      "color",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Preto"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-xs font-medium text-foreground">
                                  Foto da cor
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) => {
                                    const selectedFile = event.target.files?.[0] ?? null;

                                    if (
                                      selectedFile &&
                                      selectedFile.size > MAX_SITE_IMAGE_UPLOAD_SIZE_BYTES
                                    ) {
                                      setProductError(
                                        `A imagem "${selectedFile.name}" ultrapassa o limite de ${MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL}.`
                                      );
                                      event.target.value = "";
                                      return;
                                    }

                                    handleProductVariantChange(
                                      variant.localId,
                                      "imageFile",
                                      selectedFile
                                    );
                                    setProductError("");
                                  }}
                                  className="h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-xs text-foreground"
                                />
                                {variant.imageFile ? (
                                  <p className="mt-1 min-h-4 truncate text-xs text-muted-foreground">
                                    {variant.imageFile.name}
                                  </p>
                                ) : variant.imageUrl ? (
                                  <p className="mt-1 min-h-4 text-xs text-muted-foreground">
                                    Foto cadastrada
                                  </p>
                                ) : (
                                  <p className="mt-1 min-h-4 text-xs text-destructive">
                                    Foto obrigatória
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="mb-2 block text-xs font-medium text-foreground">
                                  Estoque
                                </label>
                                <Input
                                  className="h-10"
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={variant.stock}
                                  onChange={(event) =>
                                    handleProductVariantChange(
                                      variant.localId,
                                      "stock",
                                      event.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <span className="mb-2 block text-xs font-medium text-foreground">
                                  Status
                                </span>
                                <label className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-foreground">
                                <input
                                  type="checkbox"
                                  checked={variant.active}
                                  onChange={(event) =>
                                    handleProductVariantChange(
                                      variant.localId,
                                      "active",
                                      event.target.checked
                                    )
                                  }
                                />
                                Ativa
                              </label>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                className="mt-6 h-10 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveProductVariant(variant.localId)}
                              >
                                Remover
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-white p-4 text-sm text-muted-foreground">
                          Nenhuma cor cadastrada para este produto.
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Foto do produto
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageChange}
                        className="w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-foreground"
                      />
                      {image ? (
                        <p className="text-sm text-muted-foreground mt-2">
                          Arquivo selecionado: {image.name}
                        </p>
                      ) : editingItemId ? (
                        <p className="text-sm text-muted-foreground mt-2">
                          Envie uma nova imagem apenas se quiser substituir a atual.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={productIsFeatured}
                      onChange={(event) => setProductIsFeatured(event.target.checked)}
                      className="h-4 w-4 rounded border border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    Destacar produto na Home
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" className="w-full sm:w-auto" disabled={isSavingProduct}>
                      {isSavingProduct
                        ? "Salvando..."
                        : editingItemId
                          ? "Salvar alterações"
                          : "Salvar item"}
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
                <h2 className="text-lg font-semibold text-foreground mb-4">Produtos cadastrados</h2>
                <div className="space-y-4">
                  {catalogItems.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-3xl border border-border bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                Sem foto
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              {product.category_name ? (
                                <span className="rounded-full bg-white px-3 py-1 text-muted-foreground">
                                  {product.category_name}
                                </span>
                              ) : null}
                              <span className="rounded-full bg-white px-3 py-1 text-muted-foreground">
                                Estoque: {product.stock}
                              </span>
                              {(productColorsById[product.id] ?? []).length > 0 ? (
                                <span className="rounded-full bg-white px-3 py-1 text-muted-foreground">
                                  Cores: {productColorsById[product.id].join(", ")}
                                </span>
                              ) : (
                                <span className="rounded-full bg-white px-3 py-1 text-muted-foreground">
                                  Sem cores cadastradas
                                </span>
                              )}
                              {product.is_featured ? (
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                  Destaque
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          <p className="font-semibold text-foreground">
                            R$ {product.price.toFixed(2)}
                          </p>
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
              {collectionError ? (
                <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {collectionError}
                </div>
              ) : null}
              {collectionFeedback ? (
                <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
                  {collectionFeedback}
                </div>
              ) : null}

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

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Tipo de destaque
                  </label>
                  <Input
                    type="text"
                    value={collectionHighlightLabel}
                    onChange={(e) => setCollectionHighlightLabel(e.target.value)}
                    placeholder="Ex: Mais vendidos, Destaque da semana, Novidades"
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
                  {availableProducts.length > 0 ? (
                    <div className="grid max-h-80 gap-3 overflow-y-auto">
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
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(product.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-4 text-sm text-muted-foreground">
                      Nenhum produto ativo encontrado no Supabase. Cadastre ou ative produtos na aba Produtos antes de criar uma coleção.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSavingCollection}>
                    {isSavingCollection
                      ? "Salvando..."
                      : editingCollectionId
                        ? "Salvar alterações"
                        : "Criar coleção"}
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
                          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                            {collection.highlight_label}
                          </p>
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
        ) : activeTab === "clientes" ? (
          <div className="mt-8 space-y-8">
            <div className="rounded-3xl border border-border bg-background p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Clientes</h2>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe os cadastros criados na loja.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={loadProfiles} disabled={isLoadingProfiles}>
                  {isLoadingProfiles ? "Atualizando..." : "Atualizar clientes"}
                </Button>
              </div>

              {profilesError ? (
                <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {profilesError}
                </div>
              ) : null}

              {isLoadingProfiles ? (
                <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Carregando clientes...
                </div>
              ) : profiles.length > 0 ? (
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="rounded-3xl border border-border bg-white p-5 shadow-sm"
                    >
                      <div className="grid gap-4 md:grid-cols-[1.2fr_1.4fr_0.9fr_0.8fr] md:items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="font-semibold text-foreground">
                            {profile.name || "Cliente sem nome"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">E-mail</p>
                          <p className="break-all font-semibold text-foreground">
                            {profile.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                          <p className="font-semibold text-foreground">
                            {profile.phone || "Não informado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Perfil</p>
                          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            {profile.role === "admin" ? "Admin" : "Cliente"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground">
                        Cadastro em {new Date(profile.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Nenhum cliente cadastrado ainda.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "cupons" ? (
          <div className="mt-8 space-y-8">
            <div className="rounded-3xl border border-border bg-background p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {editingCouponId ? "Editar cupom" : "Novo cupom"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Cadastre descontos por valor fixo ou porcentagem para os clientes usarem no carrinho.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={loadCoupons} disabled={isLoadingCoupons}>
                  {isLoadingCoupons ? "Atualizando..." : "Atualizar cupons"}
                </Button>
              </div>

              {couponError ? (
                <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {couponError}
                </div>
              ) : null}
              {couponFeedback ? (
                <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
                  {couponFeedback}
                </div>
              ) : null}

              <form className="space-y-6" onSubmit={handleSaveCoupon}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Código do cupom
                    </label>
                    <Input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="EX: DESCONTO10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Descrição opcional
                    </label>
                    <Input
                      value={couponDescription}
                      onChange={(event) => setCouponDescription(event.target.value)}
                      placeholder="Ex: Campanha de lançamento"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Tipo de desconto
                    </label>
                    <select
                      value={couponDiscountType}
                      onChange={(event) =>
                        setCouponDiscountType(event.target.value as CouponDiscountType)
                      }
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="percentage">Porcentagem</option>
                      <option value="fixed">Valor fixo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {couponDiscountType === "percentage" ? "Porcentagem" : "Valor do desconto"}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={couponDiscountType === "percentage" ? 100 : undefined}
                      step="0.01"
                      value={couponDiscountValue}
                      onChange={(event) => setCouponDiscountValue(event.target.value)}
                      placeholder={couponDiscountType === "percentage" ? "10" : "25.00"}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Compra mínima
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={couponMinPurchase}
                      onChange={(event) => setCouponMinPurchase(event.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={couponActive}
                      onChange={(event) => setCouponActive(event.target.checked)}
                      className="h-4 w-4"
                    />
                    Cupom ativo
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" disabled={isSavingCoupon}>
                    {isSavingCoupon
                      ? "Salvando..."
                      : editingCouponId
                        ? "Salvar alterações"
                        : "Criar cupom"}
                  </Button>
                  {editingCouponId ? (
                    <Button type="button" variant="outline" onClick={resetCouponForm}>
                      Cancelar edição
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="rounded-3xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Cupons cadastrados</h2>

              {isLoadingCoupons ? (
                <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Carregando cupons...
                </div>
              ) : coupons.length > 0 ? (
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="rounded-3xl border border-border bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {coupon.code}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                              coupon.active
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-200 text-slate-600"
                            }`}>
                              {coupon.active ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                          <p className="font-semibold text-foreground">
                            {coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}% de desconto`
                              : `${formatCurrency(coupon.discount_value)} de desconto`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Compra mínima: {formatCurrency(coupon.min_purchase)}
                          </p>
                          {coupon.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {coupon.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button type="button" variant="outline" onClick={() => handleEditCoupon(coupon.id)}>
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDisableCoupon(coupon.id)}
                            disabled={!coupon.active}
                          >
                            Desativar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Nenhum cupom cadastrado ainda.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "frete" ? (
          <div className="mt-8 space-y-8">
            <div className="rounded-3xl border border-border bg-background p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Frete</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure o valor padrão, o mínimo para frete grátis e o prazo exibido no checkout.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSaveShipping}>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Valor do frete padrão
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingSettings.baseShippingCost}
                      onChange={(event) =>
                        handleShippingFieldChange("baseShippingCost", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Mínimo para frete grátis
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingSettings.freeShippingMinPurchase}
                      onChange={(event) =>
                        handleShippingFieldChange(
                          "freeShippingMinPurchase",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Prazo de entrega
                    </label>
                    <Input
                      type="text"
                      value={shippingSettings.deliveryEstimate}
                      onChange={(event) =>
                        handleShippingFieldChange("deliveryEstimate", event.target.value)
                      }
                      placeholder="3 a 5 dias úteis"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={shippingSettings.freeShippingEnabled}
                    onChange={(event) =>
                      handleShippingFieldChange(
                        "freeShippingEnabled",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />
                  Ativar frete grátis por valor mínimo
                </label>

                <div className="rounded-3xl border border-border bg-white p-6">
                  <p className="text-sm font-semibold text-foreground mb-2">Prévia</p>
                  <p className="text-sm text-muted-foreground">
                    Frete padrão: {formatCurrency(shippingSettings.baseShippingCost)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {shippingSettings.freeShippingEnabled
                      ? `Frete grátis acima de ${formatCurrency(shippingSettings.freeShippingMinPurchase)}.`
                      : "Frete grátis desativado."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Prazo: {shippingSettings.deliveryEstimate}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="w-full sm:w-auto">
                      Salvar frete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetShipping}
                      className="w-full sm:w-auto"
                    >
                      Restaurar padrão
                    </Button>
                  </div>
                  {shippingSaved ? (
                    <p className="text-sm font-medium text-primary">
                      Frete salvo. Carrinho e checkout já usam essa configuração.
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        ) : activeTab === "banner" ? (
          <div className="mt-8 space-y-8">
            <div className="rounded-3xl border border-border bg-background p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Banner da Home</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Edite o texto principal, os botões e as imagens exibidas atrás do título da página inicial.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSaveBanner}>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Chamada superior
                  </label>
                  <Input
                    type="text"
                    value={bannerSettings.eyebrow}
                    onChange={(event) => handleBannerFieldChange("eyebrow", event.target.value)}
                    placeholder="Ex: Nova coleção com descontos especiais"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Título principal
                  </label>
                  <Input
                    type="text"
                    value={bannerSettings.title}
                    onChange={(event) => handleBannerFieldChange("title", event.target.value)}
                    placeholder="Vista sua melhor versão com a borbô"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Descrição
                  </label>
                  <Textarea
                    value={bannerSettings.description}
                    onChange={(event) => handleBannerFieldChange("description", event.target.value)}
                    placeholder="Texto de apoio do banner"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Texto do botão principal
                    </label>
                    <Input
                      type="text"
                      value={bannerSettings.primaryButtonLabel}
                      onChange={(event) => handleBannerFieldChange("primaryButtonLabel", event.target.value)}
                      placeholder="Ver coleção"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Link do botão principal
                    </label>
                    <Input
                      type="text"
                      value={bannerSettings.primaryButtonHref}
                      onChange={(event) => handleBannerFieldChange("primaryButtonHref", event.target.value)}
                      placeholder="/shop"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Link do Instagram
                  </label>
                  <Input
                    type="url"
                    value={bannerSettings.instagramHref}
                    onChange={(event) => handleBannerFieldChange("instagramHref", event.target.value)}
                    placeholder="https://www.instagram.com/seja.borbo/"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Imagens do fundo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBannerImageUpload}
                    className="mb-3 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mb-3">
                    Envie até 5 imagens. Cada imagem deve ter no máximo {MAX_SITE_IMAGE_UPLOAD_SIZE_LABEL}.
                  </p>
                  {bannerUploadError ? (
                    <p className="mb-3 text-sm font-medium text-destructive">
                      {bannerUploadError}
                    </p>
                  ) : null}
                  {bannerImagesText
                    .split("\n")
                    .map((imageUrl) => imageUrl.trim())
                    .filter(Boolean).length > 0 ? (
                    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      {bannerImagesText
                        .split("\n")
                        .map((imageUrl) => imageUrl.trim())
                        .filter(Boolean)
                        .map((imageUrl, index) => (
                          <div
                            key={`${imageUrl}-${index}`}
                            className="overflow-hidden rounded-2xl border border-border bg-white"
                          >
                            <div className="aspect-square bg-muted">
                              <img
                                src={imageUrl}
                                alt={`Imagem ${index + 1} do banner`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveBannerImage(index)}
                              className="w-full px-3 py-2 text-xs font-medium text-destructive hover:bg-rose-50"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : null}
                  <Textarea
                    value={bannerImagesText}
                    onChange={(event) => {
                      setBannerImagesText(event.target.value);
                      setBannerSaved(false);
                    }}
                    placeholder="Cole uma URL por linha"
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use até 5 URLs de imagem. Uma imagem por linha.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-white p-6">
                  <p className="text-sm font-semibold text-foreground mb-2">Prévia textual</p>
                  <p className="text-xs uppercase tracking-widest text-primary">
                    {bannerSettings.eyebrow}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">
                    {bannerSettings.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {bannerSettings.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="w-full sm:w-auto">
                      Salvar banner
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetBanner}
                      className="w-full sm:w-auto"
                    >
                      Restaurar padrão
                    </Button>
                  </div>
                  {bannerSaved ? (
                    <p className="text-sm font-medium text-primary">
                      Banner salvo. Volte para a Home para visualizar.
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        ) : activeTab === "rodape" ? (
          <div className="mt-8 space-y-8">
            <div className="rounded-3xl border border-border bg-background p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Rodapé do site</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Edite as informações institucionais do rodapé e mantenha o Instagram como canal principal da marca.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSaveFooter}>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Texto institucional da marca
                  </label>
                  <Textarea
                    value={footerSettings.brandDescription}
                    onChange={(event) => handleFooterFieldChange("brandDescription", event.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Atendimento/localização
                    </label>
                    <Input
                      type="text"
                      value={footerSettings.serviceLocation}
                      onChange={(event) => handleFooterFieldChange("serviceLocation", event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Telefone
                    </label>
                    <Input
                      type="text"
                      value={footerSettings.phone}
                      onChange={(event) => handleFooterFieldChange("phone", event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      value={footerSettings.email}
                      onChange={(event) => handleFooterFieldChange("email", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Link do Instagram
                  </label>
                  <Input
                    type="url"
                    value={footerSettings.instagramHref}
                    onChange={(event) => handleFooterFieldChange("instagramHref", event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Título da chamada para Instagram
                    </label>
                    <Input
                      type="text"
                      value={footerSettings.instagramTitle}
                      onChange={(event) => handleFooterFieldChange("instagramTitle", event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Texto final do rodapé
                    </label>
                    <Input
                      type="text"
                      value={footerSettings.copyrightText}
                      onChange={(event) => handleFooterFieldChange("copyrightText", event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Descrição da chamada para Instagram
                  </label>
                  <Textarea
                    value={footerSettings.instagramDescription}
                    onChange={(event) => handleFooterFieldChange("instagramDescription", event.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="rounded-3xl border border-border bg-white p-6">
                  <p className="text-sm font-semibold text-foreground mb-2">Prévia textual</p>
                  <h3 className="text-xl font-semibold text-foreground">
                    {footerSettings.instagramTitle}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {footerSettings.instagramDescription}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {footerSettings.brandDescription}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" className="w-full sm:w-auto">
                      Salvar rodapé
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetFooter}
                      className="w-full sm:w-auto"
                    >
                      Restaurar padrão
                    </Button>
                  </div>
                  {footerSaved ? (
                    <p className="text-sm font-medium text-primary">
                      Rodapé salvo. Volte para a Home para visualizar.
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pedidos</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Acompanhe compras reais, veja dados de entrega e atualize o status para o cliente.
              </p>

              {ordersError ? (
                <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {ordersError}
                </div>
              ) : null}
              {ordersFeedback ? (
                <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
                  {ordersFeedback}
                </div>
              ) : null}

              <div className="mb-4 flex justify-end">
                <Button type="button" variant="outline" onClick={loadOrders} disabled={isLoadingOrders}>
                  {isLoadingOrders ? "Atualizando..." : "Atualizar pedidos"}
                </Button>
              </div>

              {isLoadingOrders ? (
                <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Carregando pedidos...
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-3xl border border-border bg-white p-6"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                              Compra
                            </span>
                            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {orderStatusLabels[order.status]}
                            </span>
                          </div>
                          <p className="font-semibold text-foreground mb-1">
                            Pedido #{order.order_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_name} • {order.customer_email} • {order.customer_phone}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Criado em {new Date(order.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>

                        <div className="w-full lg:w-64">
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Status do pedido
                          </label>
                          <select
                            value={order.status}
                            onChange={(event) =>
                              handleUpdateOrderStatus(
                                order.id,
                                event.target.value as OrderStatus
                              )
                            }
                            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {Object.entries(orderStatusLabels).map(([status, label]) => (
                              <option key={status} value={status}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-border bg-slate-50 p-4 text-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="font-medium text-foreground mb-2">Entrega</p>
                            <p className="text-muted-foreground">
                              {formatShippingAddress(order.shipping_address)}
                            </p>
                            {order.customer_cpf ? (
                              <p className="mt-2 text-muted-foreground">
                                CPF: {order.customer_cpf}
                              </p>
                            ) : null}
                          </div>
                          <div>
                            <p className="font-medium text-foreground mb-2">Pagamento</p>
                            <p className="text-muted-foreground">
                              {paymentMethodLabels[order.payment_method]} • {order.payment_status}
                            </p>
                            <p className="mt-2 font-semibold text-foreground">
                              Total: {formatCurrency(order.total)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="font-medium text-foreground mb-3">Itens</p>
                          <div className="space-y-2">
                            {(order.order_items ?? []).map((item) => (
                              <div
                                key={item.id}
                                className="flex flex-col gap-2 rounded-2xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {item.product_name}
                                  </p>
                                  <p className="text-muted-foreground">
                                    Quantidade: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-semibold text-foreground">
                                  {formatCurrency(item.subtotal)}
                                </p>
                              </div>
                            ))}
                            {(order.order_items ?? []).length === 0 ? (
                              <p className="text-muted-foreground">
                                Nenhum item encontrado para este pedido.
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {order.notes ? (
                          <div className="mt-4">
                            <p className="font-medium text-foreground mb-2">Observações</p>
                            <p className="text-muted-foreground">{order.notes}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-slate-50 p-6 text-sm text-muted-foreground">
                  Não há pedidos registrados no momento.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
