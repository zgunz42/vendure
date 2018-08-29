import {
    AddOptionGroupToProduct,
    AddOptionGroupToProductVariables,
    ApplyFacetValuesToProductVariants,
    ApplyFacetValuesToProductVariantsVariables,
    CreateProduct,
    CreateProduct_createProduct,
    CreateProductVariables,
    GenerateProductVariants,
    GenerateProductVariants_generateVariantsForProduct_variants,
    GenerateProductVariantsVariables,
    GetProductList,
    GetProductListVariables,
    GetProductWithVariants,
    GetProductWithVariantsVariables,
    LanguageCode,
    RemoveOptionGroupFromProduct,
    RemoveOptionGroupFromProductVariables,
    SortOrder,
    UpdateProduct,
    UpdateProductVariables,
    UpdateProductVariants,
    UpdateProductVariantsVariables,
} from 'shared/generated-types';

import {
    ADD_OPTION_GROUP_TO_PRODUCT,
    APPLY_FACET_VALUE_TO_PRODUCT_VARIANTS,
    CREATE_PRODUCT,
    GENERATE_PRODUCT_VARIANTS,
    REMOVE_OPTION_GROUP_FROM_PRODUCT,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_VARIANTS,
} from '../../admin-ui/src/app/data/mutations/product-mutations';
import {
    GET_PRODUCT_LIST,
    GET_PRODUCT_WITH_VARIANTS,
} from '../../admin-ui/src/app/data/queries/product-queries';

import { TestClient } from './test-client';
import { TestServer } from './test-server';

describe('Product resolver', () => {
    const client = new TestClient();
    const server = new TestServer();

    beforeAll(async () => {
        await server.init({
            productCount: 20,
            customerCount: 1,
        });
    }, 30000);

    afterAll(async () => {
        await server.destroy();
    });

    describe('products list query', () => {
        it('returns all products when no options passed', async () => {
            const result = await client.query<GetProductList, GetProductListVariables>(GET_PRODUCT_LIST, {
                languageCode: LanguageCode.en,
            });

            expect(result.products.items.length).toBe(20);
            expect(result.products.totalItems).toBe(20);
        });

        it('limits result set with skip & take', async () => {
            const result = await client.query<GetProductList, GetProductListVariables>(GET_PRODUCT_LIST, {
                languageCode: LanguageCode.en,
                options: {
                    skip: 0,
                    take: 3,
                },
            });

            expect(result.products.items.length).toBe(3);
            expect(result.products.totalItems).toBe(20);
        });

        it('filters by name', async () => {
            const result = await client.query<GetProductList, GetProductListVariables>(GET_PRODUCT_LIST, {
                languageCode: LanguageCode.en,
                options: {
                    filter: {
                        name: {
                            contains: 'fish',
                        },
                    },
                },
            });

            expect(result.products.items.length).toBe(1);
            expect(result.products.items[0].name).toBe('en Practical Frozen Fish');
        });

        it('sorts by name', async () => {
            const result = await client.query<GetProductList, GetProductListVariables>(GET_PRODUCT_LIST, {
                languageCode: LanguageCode.en,
                options: {
                    sort: {
                        name: SortOrder.ASC,
                    },
                },
            });

            expect(result.products.items.map(p => p.name)).toEqual([
                'en Fantastic Granite Salad',
                'en Fantastic Rubber Sausages',
                'en Generic Metal Keyboard',
                'en Generic Wooden Sausages',
                'en Handcrafted Granite Shirt',
                'en Handcrafted Plastic Gloves',
                'en Handmade Cotton Salad',
                'en Incredible Metal Shirt',
                'en Incredible Steel Cheese',
                'en Intelligent Frozen Ball',
                'en Intelligent Wooden Car',
                'en Licensed Cotton Shirt',
                'en Licensed Frozen Chair',
                'en Practical Frozen Fish',
                'en Refined Fresh Bacon',
                'en Rustic Steel Salad',
                'en Rustic Wooden Hat',
                'en Small Granite Chicken',
                'en Small Steel Cheese',
                'en Tasty Soft Gloves',
            ]);
        });
    });

    describe('product query', () => {
        it('returns expected properties', async () => {
            const result = await client.query<GetProductWithVariants, GetProductWithVariantsVariables>(
                GET_PRODUCT_WITH_VARIANTS,
                {
                    languageCode: LanguageCode.en,
                    id: '2',
                },
            );

            if (!result.product) {
                fail('Product not found');
                return;
            }
            expect(result.product).toEqual(
                expect.objectContaining({
                    description: 'en Ut nulla quam ipsam nobis cupiditate sed dignissimos debitis incidunt.',
                    id: '2',
                    image: 'http://lorempixel.com/640/480',
                    languageCode: 'en',
                    name: 'en Incredible Metal Shirt',
                    optionGroups: [
                        {
                            code: 'size',
                            id: '1',
                            languageCode: 'en',
                            name: 'Size',
                        },
                    ],
                    slug: 'en incredible-metal-shirt',
                    translations: [
                        {
                            description:
                                'en Ut nulla quam ipsam nobis cupiditate sed dignissimos debitis incidunt.',
                            languageCode: 'en',
                            name: 'en Incredible Metal Shirt',
                            slug: 'en incredible-metal-shirt',
                        },
                        {
                            description:
                                'de Ut nulla quam ipsam nobis cupiditate sed dignissimos debitis incidunt.',
                            languageCode: 'de',
                            name: 'de Incredible Metal Shirt',
                            slug: 'de incredible-metal-shirt',
                        },
                    ],
                }),
            );
        });

        it('returns null when id not found', async () => {
            const result = await client.query<GetProductWithVariants, GetProductWithVariantsVariables>(
                GET_PRODUCT_WITH_VARIANTS,
                {
                    languageCode: LanguageCode.en,
                    id: 'bad_id',
                },
            );

            expect(result.product).toBeNull();
        });
    });

    describe('product mutation', () => {
        let newProduct: CreateProduct_createProduct;

        it('createProduct creates a new Product', async () => {
            const result = await client.query<CreateProduct, CreateProductVariables>(CREATE_PRODUCT, {
                input: {
                    image: 'baked-potato',
                    translations: [
                        {
                            languageCode: LanguageCode.en,
                            name: 'en Baked Potato',
                            slug: 'en-baked-potato',
                            description: 'A baked potato',
                        },
                        {
                            languageCode: LanguageCode.de,
                            name: 'de Baked Potato',
                            slug: 'de-baked-potato',
                            description: 'Eine baked Erdapfel',
                        },
                    ],
                },
            });
            newProduct = result.createProduct;
            expect(newProduct).toMatchSnapshot();
        });

        it('updateProduct updates a Product', async () => {
            const result = await client.query<UpdateProduct, UpdateProductVariables>(UPDATE_PRODUCT, {
                input: {
                    id: newProduct.id,
                    image: 'mashed-potato',
                    translations: [
                        {
                            languageCode: LanguageCode.en,
                            name: 'en Mashed Potato',
                            slug: 'en-mashed-potato',
                            description: 'A blob of mashed potato',
                        },
                        {
                            languageCode: LanguageCode.de,
                            name: 'de Mashed Potato',
                            slug: 'de-mashed-potato',
                            description: 'Eine blob von gemashed Erdapfel',
                        },
                    ],
                },
            });
            expect(result.updateProduct).toMatchSnapshot();
        });

        it('updateProduct errors with an invalid productId', async () => {
            try {
                await client.query<UpdateProduct, UpdateProductVariables>(UPDATE_PRODUCT, {
                    input: {
                        id: '999',
                        image: 'mashed-potato',
                        translations: [
                            {
                                languageCode: LanguageCode.en,
                                name: 'en Mashed Potato',
                                slug: 'en-mashed-potato',
                                description: 'A blob of mashed potato',
                            },
                            {
                                languageCode: LanguageCode.de,
                                name: 'de Mashed Potato',
                                slug: 'de-mashed-potato',
                                description: 'Eine blob von gemashed Erdapfel',
                            },
                        ],
                    },
                });
                fail('Should have thrown');
            } catch (err) {
                expect(err.message).toEqual(
                    expect.stringContaining("No Product with the id '999' could be found"),
                );
            }
        });

        it('addOptionGroupToProduct adds an option group', async () => {
            const result = await client.query<AddOptionGroupToProduct, AddOptionGroupToProductVariables>(
                ADD_OPTION_GROUP_TO_PRODUCT,
                {
                    optionGroupId: '1',
                    productId: newProduct.id,
                },
            );
            expect(result.addOptionGroupToProduct.optionGroups.length).toBe(1);
            expect(result.addOptionGroupToProduct.optionGroups[0].id).toBe('1');
        });

        it('addOptionGroupToProduct errors with an invalid productId', async () => {
            try {
                await client.query<AddOptionGroupToProduct, AddOptionGroupToProductVariables>(
                    ADD_OPTION_GROUP_TO_PRODUCT,
                    {
                        optionGroupId: '1',
                        productId: '999',
                    },
                );
                fail('Should have thrown');
            } catch (err) {
                expect(err.message).toEqual(
                    expect.stringContaining("No Product with the id '999' could be found"),
                );
            }
        });

        it('addOptionGroupToProduct errors with an invalid optionGroupId', async () => {
            try {
                await client.query<AddOptionGroupToProduct, AddOptionGroupToProductVariables>(
                    ADD_OPTION_GROUP_TO_PRODUCT,
                    {
                        optionGroupId: '999',
                        productId: newProduct.id,
                    },
                );
                fail('Should have thrown');
            } catch (err) {
                expect(err.message).toEqual(
                    expect.stringContaining("No OptionGroup with the id '999' could be found"),
                );
            }
        });

        it('removeOptionGroupFromProduct removes an option group', async () => {
            const result = await client.query<
                RemoveOptionGroupFromProduct,
                RemoveOptionGroupFromProductVariables
            >(REMOVE_OPTION_GROUP_FROM_PRODUCT, {
                optionGroupId: '1',
                productId: '1',
            });
            expect(result.removeOptionGroupFromProduct.optionGroups.length).toBe(0);
        });

        it('removeOptionGroupFromProduct errors with an invalid productId', async () => {
            try {
                await client.query<RemoveOptionGroupFromProduct, RemoveOptionGroupFromProductVariables>(
                    REMOVE_OPTION_GROUP_FROM_PRODUCT,
                    {
                        optionGroupId: '1',
                        productId: '999',
                    },
                );
                fail('Should have thrown');
            } catch (err) {
                expect(err.message).toEqual(
                    expect.stringContaining("No Product with the id '999' could be found"),
                );
            }
        });

        describe('variants', () => {
            let variants: GenerateProductVariants_generateVariantsForProduct_variants[];

            it('generateVariantsForProduct generates variants', async () => {
                const result = await client.query<GenerateProductVariants, GenerateProductVariantsVariables>(
                    GENERATE_PRODUCT_VARIANTS,
                    {
                        productId: newProduct.id,
                        defaultPrice: 123,
                        defaultSku: 'ABC',
                    },
                );
                variants = result.generateVariantsForProduct.variants;
                expect(variants).toMatchSnapshot();
            });

            it('generateVariantsForProduct throws with an invalid productId', async () => {
                try {
                    await client.query<GenerateProductVariants, GenerateProductVariantsVariables>(
                        GENERATE_PRODUCT_VARIANTS,
                        {
                            productId: '999',
                        },
                    );
                    fail('Should have thrown');
                } catch (err) {
                    expect(err.message).toEqual(
                        expect.stringContaining("No Product with the id '999' could be found"),
                    );
                }
            });

            it('updateProductVariants updates variants', async () => {
                const firstVariant = variants[0];
                const result = await client.query<UpdateProductVariants, UpdateProductVariantsVariables>(
                    UPDATE_PRODUCT_VARIANTS,
                    {
                        input: [
                            {
                                id: firstVariant.id,
                                translations: firstVariant.translations,
                                sku: 'ABC',
                                image: 'new-image',
                                price: 432,
                            },
                        ],
                    },
                );
                expect(result.updateProductVariants).toMatchSnapshot();
            });

            it('updateProductVariants throws with an invalid variant id', async () => {
                try {
                    await client.query<UpdateProductVariants, UpdateProductVariantsVariables>(
                        UPDATE_PRODUCT_VARIANTS,
                        {
                            input: [
                                {
                                    id: '999',
                                    translations: variants[0].translations,
                                    sku: 'ABC',
                                    image: 'new-image',
                                    price: 432,
                                },
                            ],
                        },
                    );
                    fail('Should have thrown');
                } catch (err) {
                    expect(err.message).toEqual(
                        expect.stringContaining("No ProductVariant with the id '999' could be found"),
                    );
                }
            });

            it('applyFacetValuesToProductVariants adds facets to variants', async () => {
                const result = await client.query<
                    ApplyFacetValuesToProductVariants,
                    ApplyFacetValuesToProductVariantsVariables
                >(APPLY_FACET_VALUE_TO_PRODUCT_VARIANTS, {
                    facetValueIds: ['1', '3', '5'],
                    productVariantIds: variants.map(v => v.id),
                });
                expect(result.applyFacetValuesToProductVariants).toMatchSnapshot();
            });

            it('applyFacetValuesToProductVariants errors with invalid facet value id', async () => {
                try {
                    await client.query<
                        ApplyFacetValuesToProductVariants,
                        ApplyFacetValuesToProductVariantsVariables
                    >(APPLY_FACET_VALUE_TO_PRODUCT_VARIANTS, {
                        facetValueIds: ['999', '888'],
                        productVariantIds: variants.map(v => v.id),
                    });
                    fail('Should have thrown');
                } catch (err) {
                    expect(err.message).toEqual(
                        expect.stringContaining("No FacetValue with the id '999' could be found"),
                    );
                }
            });

            it('applyFacetValuesToProductVariants errors with invalid variant id', async () => {
                try {
                    await client.query<
                        ApplyFacetValuesToProductVariants,
                        ApplyFacetValuesToProductVariantsVariables
                    >(APPLY_FACET_VALUE_TO_PRODUCT_VARIANTS, {
                        facetValueIds: ['1', '3', '5'],
                        productVariantIds: ['999'],
                    });
                    fail('Should have thrown');
                } catch (err) {
                    expect(err.message).toEqual(
                        expect.stringContaining("No ProductVariant with the id '999' could be found"),
                    );
                }
            });
        });
    });
});