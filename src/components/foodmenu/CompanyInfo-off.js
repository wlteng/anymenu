import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Globe, Facebook, Twitter, Instagram } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading';
import { useToast } from '../../contexts/ToastContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getShopByUsername } from '../../firebase/utils';
import Header from '../Layout/Header';

const CompanyInfo = () => {
  // Hooks must be called at the top level, before any conditional returns
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    seoTitle: '',
    seoDescription: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    websiteUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    keywords: '',
  });

  useEffect(() => {
    loadShop();
  }, [username]);

  const loadShop = async () => {
    if (!username) return;
    
    setIsLoading(true);
    try {
      const shopData = await getShopByUsername(username);
      if (!shopData) {
        showToast({
          title: 'Error',
          description: 'Shop not found',
          type: 'error'
        });
        navigate('/my-shops');
        return;
      }
      setShop(shopData);
      setFormData({
        description: shopData.description || '',
        seoTitle: shopData.seoTitle || '',
        seoDescription: shopData.seoDescription || '',
        ogTitle: shopData.ogTitle || '',
        ogDescription: shopData.ogDescription || '',
        ogImage: shopData.ogImage || '',
        websiteUrl: shopData.websiteUrl || '',
        facebookUrl: shopData.facebookUrl || '',
        twitterUrl: shopData.twitterUrl || '',
        instagramUrl: shopData.instagramUrl || '',
        keywords: shopData.keywords || '',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load shop data',
        type: 'error'
      });
      navigate('/my-shops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop?.id) return;

    setIsLoading(true);
    try {
      const shopRef = doc(db, 'shops', shop.id);
      await updateDoc(shopRef, {
        description: formData.description,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,
        ogImage: formData.ogImage,
        websiteUrl: formData.websiteUrl,
        facebookUrl: formData.facebookUrl,
        twitterUrl: formData.twitterUrl,
        instagramUrl: formData.instagramUrl,
        keywords: formData.keywords,
      });

      showToast({
        title: 'Success',
        description: 'Company information updated successfully'
      });
      navigate('/my-shops');
    } catch (error) {
      console.error('Error updating company info:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update company information',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Move the route check to the render logic
  if (!location.pathname.includes('/company-info')) {
    return null;
  }

  if (isLoading && !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  const Section = ({ title, children }) => (
    <div className="min-w-[400px] w-[400px] p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header shop={shop} pageTitle="Company Information" />
      
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/my-shops')}
            className="text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-6 overflow-x-auto pb-6">
            {/* Basic Information */}
            <Section title="Basic Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Describe your company..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="restaurant, food, cuisine"
                  />
                </div>
              </div>
            </Section>

            {/* SEO Information */}
            <Section title="SEO Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border rounded-lg"
                    placeholder="SEO meta description"
                  />
                </div>
              </div>
            </Section>

            {/* Social Media Links */}
            <Section title="Social Media & Website Links">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Website URL"
                  />
                </div>

                <div className="flex items-center">
                  <Facebook className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="url"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Facebook URL"
                  />
                </div>

                <div className="flex items-center">
                  <Twitter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Twitter URL"
                  />
                </div>

                <div className="flex items-center">
                  <Instagram className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="url"
                    name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder="Instagram URL"
                  />
                </div>
              </div>
            </Section>
          </div>

          {/* Fixed Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/my-shops')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              {isLoading && <LoadingSpinner />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfo;