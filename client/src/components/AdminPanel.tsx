import React, { useState } from 'react';
import { Lock, Unlock, Settings, Download, Globe, Users, ExternalLink, Image, Video, MessageSquare, Gift, Heart, Star, Eye, Code, Music, Sparkles, Camera } from 'lucide-react';
import { MediaItem } from '../types';
import { downloadAllMedia } from '../services/downloadService';
import { SiteStatus, updateSiteStatus, updateFeatureToggles } from '../services/siteStatusService';
import { ShowcaseModal } from './ShowcaseModal';
import { UserManagementModal } from './UserManagementModal';
import { SpotifyAdmin } from './SpotifyAdmin';

interface AdminPanelProps {
  isDarkMode: boolean;
  isAdmin: boolean;
  onToggleAdmin: (isAdmin: boolean) => void;
  mediaItems?: MediaItem[];
  siteStatus?: SiteStatus;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isDarkMode, 
  isAdmin, 
  onToggleAdmin,
  mediaItems = [],
  siteStatus
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadWarning, setShowDownloadWarning] = useState(false);
  const [isUpdatingSiteStatus, setIsUpdatingSiteStatus] = useState(false);
  const [isUpdatingFeatures, setIsUpdatingFeatures] = useState(false);
  const [showExternalServices, setShowExternalServices] = useState(false);
  const [showShowcase, setShowShowcase] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSpotifyAdmin, setShowSpotifyAdmin] = useState(false);

  const handleAdminToggle = () => {
    onToggleAdmin(!isAdmin);
  };

  const handleToggleSiteStatus = async () => {
    if (!siteStatus) return;

    const action = siteStatus.isUnderConstruction ? 'freischalten' : 'sperren';
    const confirmMessage = siteStatus.isUnderConstruction 
      ? '🌐 Website für alle Besucher freischalten?\n\nAlle Besucher können dann sofort auf die Galerie zugreifen.'
      : '🔒 Website für alle Besucher sperren?\n\nAlle Besucher sehen dann die Under Construction Seite.';

    if (window.confirm(confirmMessage)) {
      setIsUpdatingSiteStatus(true);
      try {
        await updateSiteStatus(!siteStatus.isUnderConstruction, 'Admin');
        
        const successMessage = siteStatus.isUnderConstruction
          ? '✅ Website wurde erfolgreich freigeschaltet!\n\n🌐 Alle Besucher können jetzt auf die Galerie zugreifen.'
          : '🔒 Website wurde erfolgreich gesperrt!\n\n⏳ Alle Besucher sehen jetzt die Under Construction Seite.';
        
        alert(successMessage);
      } catch (error) {
        alert(`❌ Fehler beim ${action} der Website:\n${error}`);
      } finally {
        setIsUpdatingSiteStatus(false);
      }
    }
  };

  const handleDownloadAll = async () => {
    const downloadableItems = mediaItems.filter(item => item.type !== 'note');
    
    if (downloadableItems.length === 0) {
      alert('Keine Medien zum Herunterladen vorhanden.');
      return;
    }

    setShowDownloadWarning(true);
  };

  const confirmDownload = async () => {
    setShowDownloadWarning(false);
    setIsDownloading(true);
    
    try {
      await downloadAllMedia(mediaItems);
      
      const downloadableItems = mediaItems.filter(item => item.type !== 'note');
      alert(`✅ Download erfolgreich!\n\n📊 Heruntergeladen:\n- ${mediaItems.filter(item => item.type === 'image').length} Bilder\n- ${mediaItems.filter(item => item.type === 'video').length} Videos\n- ${mediaItems.filter(item => item.type === 'note').length} Notizen\n\n💡 Verwende die Bilder für professionelle Fotobuch-Services!`);
    } catch (error) {
      console.error('Download error:', error);
      
      if (error.toString().includes('teilweise erfolgreich')) {
        alert(`⚠️ ${error}\n\n💡 Die ZIP-Datei enthält alle verfügbaren Dateien und Fehlerberichte.`);
      } else {
        alert(`❌ Download-Fehler:\n${error}\n\n🔧 Versuche es erneut oder verwende einen anderen Browser.`);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // NEW: Handle Post-Wedding Recap
  const handleOpenPostWeddingRecap = () => {
    const recapUrl = '/admin/post-wedding-recap';
    window.open(recapUrl, '_blank', 'noopener,noreferrer');
  };

  const getDownloadButtonText = () => {
    const imageCount = mediaItems.filter(item => item.type === 'image').length;
    const videoCount = mediaItems.filter(item => item.type === 'video').length;
    const noteCount = mediaItems.filter(item => item.type === 'note').length;
    
    if (mediaItems.length === 0) return 'Keine Medien';
    
    const parts = [];
    if (imageCount > 0) parts.push(`${imageCount} Bild${imageCount > 1 ? 'er' : ''}`);
    if (videoCount > 0) parts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`);
    if (noteCount > 0) parts.push(`${noteCount} Notiz${noteCount > 1 ? 'en' : ''}`);
    
    return parts.join(', ') + ' als ZIP';
  };

  const getSiteStatusInfo = () => {
    if (!siteStatus) return 'Status unbekannt';
    
    return siteStatus.isUnderConstruction 
      ? '🔒 Website ist gesperrt (Under Construction)'
      : '🌐 Website ist freigeschaltet';
  };

  const handleToggleGallery = async () => {
    if (!siteStatus) return;
    
    setIsUpdatingFeatures(true);
    try {
      await updateFeatureToggles(
        !siteStatus.galleryEnabled,
        siteStatus.musicWishlistEnabled,
        siteStatus.storiesEnabled,
        'Admin'
      );
    } catch (error) {
      alert('Fehler beim Aktualisieren der Galerie-Einstellung');
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const handleToggleMusicWishlist = async () => {
    if (!siteStatus) return;
    
    setIsUpdatingFeatures(true);
    try {
      await updateFeatureToggles(
        siteStatus.galleryEnabled,
        !siteStatus.musicWishlistEnabled,
        siteStatus.storiesEnabled,
        'Admin'
      );
    } catch (error) {
      alert('Fehler beim Aktualisieren der Musikwünsche-Einstellung');
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const handleToggleStories = async () => {
    if (!siteStatus) return;
    
    setIsUpdatingFeatures(true);
    try {
      await updateFeatureToggles(
        siteStatus.galleryEnabled,
        siteStatus.musicWishlistEnabled,
        !siteStatus.storiesEnabled,
        'Admin'
      );
    } catch (error) {
      alert('Fehler beim Aktualisieren der Stories-Einstellung');
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const externalServices = [
    {
      name: 'CEWE Fotobuch',
      description: 'Deutschlands Testsieger - Kostenlose Software',
      url: 'https://www.cewe.de/fotobuch',
      features: ['Kostenlose Software', 'Testsieger Stiftung Warentest', 'Echtfotopapier', 'Express-Service'],
      price: 'ab 7,95€',
      flag: '🇩🇪',
      free: true
    },
    {
      name: 'dm Fotobuch',
      description: 'Günstige Fotobücher bei dm-drogerie markt',
      url: 'https://www.dm.de/services/fotobuch',
      features: ['Günstige Preise', 'In jeder dm-Filiale abholbar', 'Verschiedene Formate', 'Schnelle Bearbeitung'],
      price: 'ab 4,95€',
      flag: '🇩🇪',
      free: false
    },
    {
      name: 'Pixum',
      description: 'Premium deutsche Fotobücher',
      url: 'https://www.pixum.de/fotobuch',
      features: ['Made in Germany', 'Umweltfreundlich', 'Lebenslange Garantie', 'Premium-Qualität'],
      price: 'ab 12,95€',
      flag: '🇩🇪',
      free: false
    },
    {
      name: 'Rossmann Fotobuch',
      description: 'Fotobücher bei Rossmann - günstig und gut',
      url: 'https://www.rossmann-fotowelt.de/fotobuch',
      features: ['Sehr günstig', 'In Rossmann-Filialen abholbar', 'Einfache Bedienung', 'Schnelle Lieferung'],
      price: 'ab 3,99€',
      flag: '🇩🇪',
      free: false
    },
    {
      name: 'Albelli',
      description: 'Europäischer Fotobuch-Service mit kostenloser Software',
      url: 'https://www.albelli.de/fotobuch',
      features: ['Kostenlose Software', 'Hochwertige Bindung', 'Verschiedene Formate', 'Gute Preise'],
      price: 'ab 9,99€',
      flag: '🇪🇺',
      free: true
    },
    {
      name: 'Mein Fotobuch',
      description: 'Deutscher Anbieter mit kostenloser Software',
      url: 'https://www.meinfotobuch.de',
      features: ['Kostenlose Software', 'Deutsche Qualität', 'Persönlicher Service', 'Flexible Gestaltung'],
      price: 'ab 8,95€',
      flag: '🇩🇪',
      free: true
    }
  ];

  return (
    <>
      {/* Main Admin Toggle Button */}
      <button
        onClick={handleAdminToggle}
        className={`fixed bottom-4 left-4 p-2 rounded-full shadow-lg transition-colors duration-300 ${
          isDarkMode
            ? isAdmin
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            : isAdmin
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
        }`}
        title={isAdmin ? "Admin-Modus verlassen" : "Admin-Modus"}
      >
        {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      </button>

      {/* Admin Controls - Instagram 2.0 Style */}
      {isAdmin && (
        <div className="fixed bottom-16 left-4 flex flex-col gap-4 max-w-xs">
          {/* POST-WEDDING RECAP BUTTON */}
          <button
            onClick={handleOpenPostWeddingRecap}
            className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
              isDarkMode
                ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-purple-500/20'
                : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-purple-500/20'
            }`}
            title="Post-Hochzeits-Zusammenfassung"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-60"></div>
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
              }`}>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Wedding Recap
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Zusammenfassung
                </div>
              </div>
            </div>
          </button>

          {/* USER MANAGEMENT BUTTON */}
          <button
            onClick={() => setShowUserManagement(true)}
            className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
              isDarkMode
                ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-cyan-500/20'
                : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-cyan-500/20'
            }`}
            title="User Management"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-60"></div>
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30' : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
              }`}>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  User Management
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Benutzer verwalten
                </div>
              </div>
            </div>
          </button>

          {/* SPOTIFY ADMIN BUTTON */}
          <button
            onClick={() => setShowSpotifyAdmin(true)}
            className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
              isDarkMode
                ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-green-500/20'
                : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-green-500/20'
            }`}
            title="Spotify Admin"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-60"></div>
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-green-600/30 to-emerald-600/30' : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
              }`}>
                <Music className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Spotify Admin
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Musik verwalten
                </div>
              </div>
            </div>
          </button>

          {/* Showcase Button */}
          <button
            onClick={() => setShowShowcase(true)}
            className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
              isDarkMode
                ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-yellow-500/20'
                : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-yellow-500/20'
            }`}
            title="WeddingPix Showcase"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 opacity-60"></div>
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-yellow-600/30 to-orange-600/30' : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
              }`}>
                <Code className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  WeddingPix
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showcase
                </div>
              </div>
            </div>
          </button>

          {/* Gallery Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleGallery}
              disabled={isUpdatingFeatures}
              className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
                isUpdatingFeatures
                  ? isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/30 cursor-not-allowed opacity-50'
                    : 'bg-white/40 border-gray-200/30 cursor-not-allowed opacity-50'
                  : isDarkMode
                    ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-blue-500/20'
                    : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-blue-500/20'
              }`}
              title={`Galerie ${siteStatus.galleryEnabled ? 'deaktivieren' : 'aktivieren'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r opacity-60 ${
                siteStatus.galleryEnabled ? 'from-blue-500/20 to-indigo-500/20' : 'from-gray-500/10 to-gray-600/10'
              }`}></div>
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  siteStatus.galleryEnabled
                    ? isDarkMode ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30' : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
                    : isDarkMode ? 'bg-gradient-to-br from-gray-600/30 to-gray-700/30' : 'bg-gradient-to-br from-gray-400/20 to-gray-500/20'
                }`}>
                  <Image className={`w-5 h-5 ${siteStatus.galleryEnabled ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Gallery
                  </div>
                  <div className={`text-xs ${
                    siteStatus.galleryEnabled
                      ? 'text-blue-400'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {siteStatus.galleryEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Music Wishlist Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleMusicWishlist}
              disabled={isUpdatingFeatures}
              className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
                isUpdatingFeatures
                  ? isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/30 cursor-not-allowed opacity-50'
                    : 'bg-white/40 border-gray-200/30 cursor-not-allowed opacity-50'
                  : isDarkMode
                    ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-purple-500/20'
                    : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-purple-500/20'
              }`}
              title={`Musikwünsche ${siteStatus.musicWishlistEnabled ? 'deaktivieren' : 'aktivieren'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r opacity-60 ${
                siteStatus.musicWishlistEnabled ? 'from-purple-500/20 to-pink-500/20' : 'from-gray-500/10 to-gray-600/10'
              }`}></div>
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  siteStatus.musicWishlistEnabled
                    ? isDarkMode ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                    : isDarkMode ? 'bg-gradient-to-br from-gray-600/30 to-gray-700/30' : 'bg-gradient-to-br from-gray-400/20 to-gray-500/20'
                }`}>
                  <Music className={`w-5 h-5 ${siteStatus.musicWishlistEnabled ? 'text-purple-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Music Wishlist
                  </div>
                  <div className={`text-xs ${
                    siteStatus.musicWishlistEnabled
                      ? 'text-purple-400'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {siteStatus.musicWishlistEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Stories Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleStories}
              disabled={isUpdatingFeatures}
              className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
                isUpdatingFeatures
                  ? isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/30 cursor-not-allowed opacity-50'
                    : 'bg-white/40 border-gray-200/30 cursor-not-allowed opacity-50'
                  : isDarkMode
                    ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-green-500/20'
                    : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-green-500/20'
              }`}
              title={`Stories ${siteStatus.storiesEnabled ? 'deaktivieren' : 'aktivieren'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r opacity-60 ${
                siteStatus.storiesEnabled ? 'from-green-500/20 to-emerald-500/20' : 'from-gray-500/10 to-gray-600/10'
              }`}></div>
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  siteStatus.storiesEnabled
                    ? isDarkMode ? 'bg-gradient-to-br from-green-600/30 to-emerald-600/30' : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                    : isDarkMode ? 'bg-gradient-to-br from-gray-600/30 to-gray-700/30' : 'bg-gradient-to-br from-gray-400/20 to-gray-500/20'
                }`}>
                  <Camera className={`w-5 h-5 ${siteStatus.storiesEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Stories
                  </div>
                  <div className={`text-xs ${
                    siteStatus.storiesEnabled
                      ? 'text-green-400'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {siteStatus.storiesEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Site Status Toggle */}
          {siteStatus && (
            <button
              onClick={handleToggleSiteStatus}
              disabled={isUpdatingSiteStatus}
              className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
                isUpdatingSiteStatus
                  ? isDarkMode
                    ? 'bg-gray-800/40 border-gray-700/30 cursor-not-allowed opacity-50'
                    : 'bg-white/40 border-gray-200/30 cursor-not-allowed opacity-50'
                  : isDarkMode
                    ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-orange-500/20'
                    : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-orange-500/20'
              }`}
              title={getSiteStatusInfo()}
            >
              <div className={`absolute inset-0 bg-gradient-to-r opacity-60 ${
                siteStatus.isUnderConstruction ? 'from-orange-500/20 to-yellow-500/20' : 'from-red-500/20 to-pink-500/20'
              }`}></div>
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  siteStatus.isUnderConstruction
                    ? isDarkMode ? 'bg-gradient-to-br from-orange-600/30 to-yellow-600/30' : 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20'
                    : isDarkMode ? 'bg-gradient-to-br from-red-600/30 to-pink-600/30' : 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
                }`}>
                  {isUpdatingSiteStatus ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Globe className={`w-5 h-5 ${siteStatus.isUnderConstruction ? 'text-orange-400' : 'text-red-400'}`} />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Website Status
                  </div>
                  <div className={`text-xs ${
                    siteStatus.isUnderConstruction
                      ? 'text-orange-400'
                      : 'text-red-400'
                  }`}>
                    {siteStatus.isUnderConstruction ? 'Gesperrt' : 'Freigeschaltet'}
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* External Services Button */}
          <button
            onClick={() => setShowExternalServices(true)}
            className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
              isDarkMode
                ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-purple-500/20'
                : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-purple-500/20'
            }`}
            title="Deutsche Fotobuch-Services"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-60"></div>
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/30' : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
              }`}>
                <Heart className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Fotobuch Services
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Deutsche Anbieter
                </div>
              </div>
            </div>
          </button>
          
          {/* ZIP Download Button */}
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading || mediaItems.length === 0}
            className={`relative p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 border overflow-hidden ${
              isDownloading || mediaItems.length === 0
                ? isDarkMode
                  ? 'bg-gray-800/40 border-gray-700/30 cursor-not-allowed opacity-50'
                  : 'bg-white/40 border-gray-200/30 cursor-not-allowed opacity-50'
                : isDarkMode
                  ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-2xl shadow-indigo-500/20'
                  : 'bg-white/80 border-gray-200/60 hover:bg-white/90 shadow-2xl shadow-indigo-500/20'
            }`}
            title={getDownloadButtonText()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 opacity-60"></div>
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-indigo-600/30 to-blue-600/30' : 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20'
              }`}>
                <Download className={`w-5 h-5 text-indigo-400 ${isDownloading ? 'animate-bounce' : ''}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ZIP Download
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {mediaItems.length === 0 ? 'Keine Medien' : `${mediaItems.length} Datei${mediaItems.length > 1 ? 'en' : ''}`}
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* USER MANAGEMENT MODAL */}
      <UserManagementModal 
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        isDarkMode={isDarkMode}
      />

      {/* SPOTIFY ADMIN MODAL */}
      {showSpotifyAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                🎵 Spotify Admin Panel
              </h3>
              <button
                onClick={() => setShowSpotifyAdmin(false)}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Spotify Admin Panel */}
            <SpotifyAdmin 
              isDarkMode={isDarkMode}
            />
            
            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowSpotifyAdmin(false)}
                className={`py-3 px-6 rounded-xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Showcase Modal */}
      <ShowcaseModal 
        isOpen={showShowcase}
        onClose={() => setShowShowcase(false)}
        isDarkMode={isDarkMode}
      />

      {/* External Services Modal */}
      {showExternalServices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'bg-purple-600' : 'bg-purple-500'
                }`}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Deutsche Fotobuch-Services 🇩🇪
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Erstelle ein hochwertiges Hochzeitsfotobuch mit deutschen Anbietern
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExternalServices(false)}
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions */}
            <div className={`p-4 rounded-xl mb-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'
            }`}>
              <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                📖 So erstellst du dein Hochzeitsfotobuch:
              </h4>
              <ol className={`text-sm space-y-1 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-200' : 'text-blue-700'
              }`}>
                <li>1. 📥 Lade alle Bilder als ZIP herunter (Button links unten)</li>
                <li>2. 🎯 Wähle einen deutschen Service unten aus</li>
                <li>3. 📤 Lade die Bilder hoch und gestalte dein Fotobuch</li>
                <li>4. 📚 Bestelle dein hochwertiges Hochzeitsfotobuch</li>
              </ol>
            </div>

            {/* Content Stats */}
            <div className={`p-4 rounded-xl mb-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📊 Verfügbare Inhalte:
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'bg-green-600' : 'bg-green-500'
                  }`}>
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {mediaItems.filter(item => item.type === 'image').length}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Bilder
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {mediaItems.filter(item => item.type === 'video').length}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Videos
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'bg-pink-600' : 'bg-pink-500'
                  }`}>
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>
                    {mediaItems.filter(item => item.type === 'note').length}
                  </div>
                  <div className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Nachrichten
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalServices.map((service, index) => (
                <div key={index} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 shadow-lg'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{service.flag}</span>
                      {service.free && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                          isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                        }`}>
                          <Gift className="w-3 h-3 inline mr-1" />
                          Kostenlos
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {service.price}
                    </span>
                  </div>
                  
                  <h4 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {service.name}
                  </h4>
                  
                  <p className={`text-sm mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {service.description}
                  </p>
                  
                  <div className="mb-4">
                    <ul className={`text-xs space-y-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Service besuchen
                  </a>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowExternalServices(false)}
                className={`py-3 px-6 rounded-xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Warning Modal */}
      {showDownloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-blue-500" />
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Medien herunterladen
              </h3>
            </div>
            
            <div className={`mb-6 space-y-3 text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>
                <strong>Was wird heruntergeladen:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{mediaItems.filter(item => item.type === 'image').length} Bilder</li>
                <li>{mediaItems.filter(item => item.type === 'video').length} Videos</li>
                <li>{mediaItems.filter(item => item.type === 'note').length} Notizen (als Textdatei)</li>
              </ul>
              
              <div className={`p-3 rounded-lg mt-4 transition-colors duration-300 ${
                isDarkMode ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className="text-xs">
                  <strong>💡 Tipp:</strong><br/>
                  Verwende die heruntergeladenen Bilder für deutsche Fotobuch-Services wie CEWE, dm oder Pixum für beste Qualität!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDownloadWarning(false)}
                className={`flex-1 py-3 px-4 rounded-xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDownload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl transition-colors"
              >
                Download starten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// X icon component
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);