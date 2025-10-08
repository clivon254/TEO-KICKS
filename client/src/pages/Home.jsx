import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiShoppingBag, FiHeart, FiTrendingUp } from 'react-icons/fi'
import Header from '../components/common/Header'
import { useGetProducts } from '../hooks/useProducts'
import { useGetCollections } from '../hooks/useCollections'


const Home = () => {

  const [featuredProducts, setFeaturedProducts] = useState([])

  const [collections, setCollections] = useState([])

  const [loading, setLoading] = useState(true)


  const { data: productsData, isLoading: loadingProducts } = useGetProducts({ limit: 8, sort: '-createdAt' })

  const { data: collectionsData, isLoading: loadingCollections } = useGetCollections({ limit: 3, sort: '-createdAt' })

  useEffect(() => {
    const apiProducts = productsData?.data?.data?.products || productsData?.data?.products || []
    const mappedProducts = apiProducts.slice(0, 4).map((p) => ({
      id: p._id || p.id,
      name: p.title || p.name,
      price: p.basePrice || p.price || 0,
      image: p.images?.[0]?.url || p.images?.[0] || 'https://via.placeholder.com/300x300/4B2E83/FFFFFF?text=Product',
      rating: p.averageRating || p.rating || 4.5,
    }))
    if (mappedProducts.length) setFeaturedProducts(mappedProducts)

    const apiCollections = collectionsData?.data?.data?.collections || collectionsData?.data?.collections || []
    const mappedCollections = apiCollections.slice(0, 3).map((c) => ({
      id: c._id || c.id,
      name: c.name,
      description: c.description || '',
      image: c.bannerImage || 'https://via.placeholder.com/400x500/E879F9/FFFFFF?text=Collection',
      productCount: c.productCount || c.productsCount || 0,
    }))
    if (mappedCollections.length) setCollections(mappedCollections)

    setLoading(loadingProducts || loadingCollections)
  }, [productsData, collectionsData, loadingProducts, loadingCollections])


  const HeroSection = () => (

    <section className="relative bg-gradient-to-br from-primary via-primary-button to-secondary min-h-[600px] flex items-center overflow-hidden">

      <div className="absolute inset-0 opacity-10">

        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>

        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>

      </div>


      <div className="container relative z-10">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="text-white space-y-6">

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">

              Step Into

              <span className="block text-secondary">Your Style</span>

            </h1>


            <p className="text-lg text-gray-100 max-w-lg">

              Discover the latest kicks from top brands. Premium quality, authentic sneakers delivered to your doorstep.

            </p>


            <div className="flex flex-wrap gap-4 pt-4">

              <Link to="/products" className="btn-secondary bg-white text-primary border-white hover:bg-gray-100 hover:scale-105 inline-flex items-center gap-2">

                Shop Now

                <FiArrowRight className="w-5 h-5" />

              </Link>


              <Link to="/collections" className="btn-outline border-white text-white hover:bg-white hover:text-primary inline-flex items-center gap-2">

                View Collections

              </Link>

            </div>


            <div className="flex items-center gap-8 pt-6">

              <div className="text-center">

                <div className="text-3xl font-bold">500+</div>

                <div className="text-sm text-gray-200">Products</div>

              </div>


              <div className="text-center">

                <div className="text-3xl font-bold">50+</div>

                <div className="text-sm text-gray-200">Brands</div>

              </div>


              <div className="text-center">

                <div className="text-3xl font-bold">10K+</div>

                <div className="text-sm text-gray-200">Happy Customers</div>

              </div>

            </div>

          </div>


          <div className="hidden lg:block">

            <div className="relative">

              <div className="absolute inset-0 bg-secondary/20 rounded-3xl transform rotate-6"></div>

              <img 

                src="https://via.placeholder.com/500x600/FFFFFF/4B2E83?text=Hero+Sneaker" 

                alt="Featured Sneaker" 

                className="relative rounded-3xl shadow-2xl w-full object-cover"

              />

            </div>

          </div>

        </div>

      </div>

    </section>

  )


  const FeaturesSection = () => (

    <section className="py-16 bg-gray-50">

      <div className="container">

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">

            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">

              <FiShoppingBag className="w-7 h-7 text-primary" />

            </div>


            <h3 className="text-xl font-semibold mb-2">Authentic Products</h3>

            <p className="text-gray-600">

              100% genuine sneakers from verified brands. Quality guaranteed on every purchase.

            </p>

          </div>


          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">

            <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">

              <FiHeart className="w-7 h-7 text-secondary" />

            </div>


            <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>

            <p className="text-gray-600">

              Not satisfied? Return within 30 days for a full refund. No questions asked.

            </p>

          </div>


          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">

            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">

              <FiTrendingUp className="w-7 h-7 text-primary" />

            </div>


            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>

            <p className="text-gray-600">

              Get your kicks delivered fast. Track your order every step of the way.

            </p>

          </div>

        </div>

      </div>

    </section>

  )


  const CollectionsSection = () => (

    <section className="py-20">

      <div className="container">

        <div className="text-center mb-12">

          <h2 className="text-4xl font-bold text-primary mb-4">Explore Collections</h2>

          <p className="text-gray-600 max-w-2xl mx-auto">

            Curated selections of the finest sneakers. Find your perfect style.

          </p>

        </div>


        {loading ? (

          <div className="grid md:grid-cols-3 gap-8">

            {[1, 2, 3].map((i) => (

              <div key={i} className="animate-pulse">

                <div className="bg-gray-200 h-80 rounded-2xl mb-4"></div>

                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>

                <div className="bg-gray-200 h-4 rounded w-1/2"></div>

              </div>

            ))}

          </div>

        ) : (

          <div className="grid md:grid-cols-3 gap-8">

            {collections.map((collection) => (

              <Link 

                key={collection.id} 

                to={`/collections/${collection.id}`}

                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"

              >

                <div className="aspect-[4/5] overflow-hidden">

                  <img 

                    src={collection.image} 

                    alt={collection.name}

                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"

                  />

                </div>


                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">

                  <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>

                  <p className="text-gray-200 text-sm mb-3">{collection.description}</p>

                  <div className="flex items-center justify-between">

                    <span className="text-sm">{collection.productCount} Products</span>

                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}


        <div className="text-center mt-12">

          <Link to="/collections" className="btn-primary inline-flex items-center gap-2">

            View All Collections

            <FiArrowRight className="w-5 h-5" />

          </Link>

        </div>

      </div>

    </section>

  )


  const FeaturedProductsSection = () => (

    <section className="py-20 bg-gray-50">

      <div className="container">

        <div className="text-center mb-12">

          <h2 className="text-4xl font-bold text-primary mb-4">Featured Products</h2>

          <p className="text-gray-600 max-w-2xl mx-auto">

            Handpicked favorites from our collection. Limited stock available.

          </p>

        </div>


        {loading ? (

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {[1, 2, 3, 4].map((i) => (

              <div key={i} className="animate-pulse">

                <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>

                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>

                <div className="bg-gray-200 h-4 rounded w-1/2"></div>

              </div>

            ))}

          </div>

        ) : (

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {featuredProducts.map((product) => (

              <Link 

                key={product.id} 

                to={`/product/${product.id}`}

                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"

              >

                <div className="aspect-square overflow-hidden bg-gray-100">

                  <img 

                    src={product.image} 

                    alt={product.name}

                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"

                  />

                </div>


                <div className="p-5">

                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">

                    {product.name}

                  </h3>


                  <div className="flex items-center gap-1 mb-3">

                    {[...Array(5)].map((_, i) => (

                      <svg

                        key={i}

                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}

                        fill="currentColor"

                        viewBox="0 0 20 20"

                      >

                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />

                      </svg>

                    ))}

                    <span className="text-sm text-gray-600 ml-1">({product.rating})</span>

                  </div>


                  <div className="flex items-center justify-between">

                    <span className="text-xl font-bold text-primary">

                      KSh {product.price.toLocaleString()}

                    </span>

                    <button className="w-9 h-9 bg-secondary-button hover:bg-secondary text-primary hover:text-white rounded-lg flex items-center justify-center transition-colors">

                      <FiShoppingBag className="w-5 h-5" />

                    </button>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}


        <div className="text-center mt-12">

          <Link to="/products" className="btn-primary inline-flex items-center gap-2">

            View All Products

            <FiArrowRight className="w-5 h-5" />

          </Link>

        </div>

      </div>

    </section>

  )


  const CTASection = () => (

    <section className="py-20">

      <div className="container">

        <div className="bg-gradient-to-br from-primary via-primary-button to-secondary rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">

          <div className="absolute inset-0 opacity-10">

            <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>

            <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>

          </div>


          <div className="relative z-10 max-w-3xl mx-auto">

            <h2 className="text-4xl md:text-5xl font-bold mb-6">

              Join the TEO KICKS Community

            </h2>


            <p className="text-xl text-gray-100 mb-8">

              Sign up today and get 10% off your first order. Be the first to know about new releases and exclusive deals.

            </p>


            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">

              <input 

                type="email" 

                placeholder="Enter your email"

                className="w-full px-6 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-secondary"

              />

              <button className="btn-secondary bg-white text-primary border-white hover:bg-gray-100 whitespace-nowrap w-full sm:w-auto">

                Subscribe

              </button>

            </div>


            <p className="text-sm text-gray-200 mt-4">

              By subscribing, you agree to our Privacy Policy and consent to receive updates.

            </p>

          </div>

        </div>

      </div>

    </section>

  )


  return (

    <div className="min-h-screen">

      <Header />

      <HeroSection />

      <FeaturesSection />

      <CollectionsSection />

      <FeaturedProductsSection />

      <CTASection />

    </div>

  )

}


export default Home

