/**
 * Home Page
 * Design: Arcane Academy - Immersive magical landing experience
 * Features: Hero banner, story introduction, village preview, animated elements
 */

import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Music, Target, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { icon: Target, key: 'home.features.rpg' },
    { icon: Music, key: 'home.features.skills' },
    { icon: RefreshCw, key: 'home.features.practice' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main content with sidebar offset on desktop */}
      <main className="lg:ml-20 pt-16 lg:pt-0">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/hero-banner.png)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: '100%',
                  opacity: 0 
                }}
                animate={{ 
                  y: '-10%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Wizard Character */}
              <motion.div
                className="mx-auto mb-8 w-48 h-48 md:w-64 md:h-64"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img 
                  src="/images/wizard-character.png" 
                  alt="Flute Wizard"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </motion.div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                <span className="text-primary text-glow-gold">{t('home.title')}</span>
              </h1>
              <p className="font-display text-xl md:text-2xl text-foreground/80 mb-6">
                {t('home.subtitle')}
              </p>
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-8">
                {t('home.description')}
              </p>

              {/* CTA Button */}
              <Link href="/village">
                <Button 
                  size="lg" 
                  className="group px-8 py-6 text-lg font-display font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-gold transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  {t('home.start')}
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="magic-card p-6 text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">{t(feature.key)}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="py-20 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-20"
            style={{ backgroundImage: 'url(/images/magic-forest-bg.png)' }}
          />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-primary text-glow-gold">
                {t('story.title')}
              </h2>

              <div className="space-y-6 text-lg leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="magic-card p-6 text-foreground/90"
                >
                  {t('story.intro')}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="magic-card p-6 text-foreground/90"
                >
                  {t('story.awakening')}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="magic-card p-6 text-foreground/90 font-semibold text-accent"
                >
                  {t('story.adventure')}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="magic-card p-6 text-foreground/90"
                >
                  {t('story.newbie')}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="magic-card p-6 text-foreground/90"
                >
                  {t('story.flute')}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Village Map Preview */}
        <section className="py-20 relative overflow-hidden">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden glow-purple"
            >
              <img 
                src="/images/village-map.png" 
                alt="Village Map"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Overlay CTA */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <Link href="/village">
                  <Button 
                    size="lg"
                    className="font-display bg-primary hover:bg-primary/90 glow-gold"
                  >
                    <Map className="w-5 h-5 mr-2" />
                    探索村莊地圖
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/images/badge-black-flute.png" 
                alt="Logo"
                className="w-10 h-10"
              />
              <span className="font-display text-xl font-bold text-primary">
                {t('home.title')}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Beatbox Flute RPG. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Map(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}
