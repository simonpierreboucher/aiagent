"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code, Copy, Check, Globe, Link as LinkIcon, ExternalLink, Loader2, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationPage() {
  const [activeTab, setActiveTab] = useState("script");
  const [copied, setCopied] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [isDomainConfigured, setIsDomainConfigured] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const chatbotId = "abc123"; // Example ID, in a real app this would come from the database
  
  const scriptCode = `<script src="https://chat.spb.dev/api/chatbot/js?id=${chatbotId}"></script>`;
  
  const iframeCode = `<iframe
  src="https://chat.spb.dev/chatbot/embed/${chatbotId}"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>`;
  
  const apiCode = `// Using fetch API
fetch('https://chat.spb.dev/api/chatbot/${chatbotId}/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "Your question here",
    sessionId: "unique-session-id"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Code copié dans le presse-papier");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const configureDomain = async () => {
    if (!customDomain) {
      toast.error("Veuillez saisir un nom de domaine");
      return;
    }
    
    // Validation simple du format du domaine
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(customDomain)) {
      toast.error("Format de domaine invalide");
      return;
    }
    
    setIsConfiguring(true);
    
    try {
      // Simuler un appel API (remplacer par un vrai appel API dans une application réelle)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Si configuration réussie
      setIsDomainConfigured(true);
      toast.success(`Domaine ${customDomain} configuré avec succès`);
      
      // Dans une application réelle, vous voudriez mettre à jour les exemples de code avec le domaine personnalisé
    } catch (error) {
      toast.error("Erreur lors de la configuration du domaine");
      console.error("Erreur de configuration:", error);
    } finally {
      setIsConfiguring(false);
    }
  };
  
  // Calculer l'URL à utiliser basée sur le domaine personnalisé ou l'URL par défaut
  const chatbotUrl = isDomainConfigured && customDomain 
    ? `https://${customDomain}/chatbot/${chatbotId}`
    : `https://chat.spb.dev/chatbot/${chatbotId}`;
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-block mb-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-75 blur-sm"></div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-background mx-auto">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 mb-2">Intégration du chatbot</h1>
        <p className="text-muted-foreground text-lg">Partagez votre assistant IA intelligent avec le monde</p>
      </div>
      
      <Card className="overflow-hidden border-primary/10 shadow-xl transition-all hover:shadow-primary/5">
        <div className="absolute right-0 top-0 -mt-4 -mr-4 h-20 w-20 rotate-12 bg-gradient-to-bl from-primary/20 to-transparent blur-2xl"></div>
        <CardHeader className="pb-4 relative">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <div className="rounded-full bg-primary/10 p-1.5">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            URL publique
          </CardTitle>
          <CardDescription className="text-base">
            Partagez ce lien pour accéder directement à votre chatbot
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-primary to-purple-500 opacity-30 blur-sm group-hover:opacity-50 transition-all"></div>
              <Input
                readOnly
                value={chatbotUrl}
                className="relative bg-muted/50 border-primary/20 font-mono"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(chatbotUrl)}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" asChild className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors">
              <a 
                href={chatbotUrl}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-primary/10 shadow-xl transition-all hover:shadow-primary/5">
        <div className="absolute left-0 top-1/3 -ml-4 h-32 w-32 rounded-full bg-gradient-to-tr from-purple-500/20 to-transparent blur-2xl"></div>
        <CardHeader className="pb-4 relative">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            Domaine personnalisé
          </CardTitle>
          <CardDescription className="text-base">
            Offrez une expérience premium avec votre propre domaine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
              <Label htmlFor="customDomain" className="text-base font-medium">Domaine personnalisé</Label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <div className={`absolute -inset-0.5 rounded-md bg-gradient-to-r from-primary to-purple-500 opacity-0 blur-sm transition-all ${customDomain ? 'group-hover:opacity-30' : ''} ${isConfiguring ? 'opacity-30 animate-pulse' : ''} ${isDomainConfigured ? 'opacity-30' : ''}`}></div>
                  <Input
                    id="customDomain"
                    placeholder="votre-domaine.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    disabled={isConfiguring || isDomainConfigured}
                    className="relative bg-muted/50 border-primary/20"
                  />
                </div>
                {isDomainConfigured ? (
                  <Button 
                    variant="outline"
                    onClick={() => setIsDomainConfigured(false)}
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    Modifier
                  </Button>
                ) : (
                  <Button 
                    onClick={configureDomain} 
                    disabled={isConfiguring || !customDomain}
                    className={`transition-all bg-gradient-to-r ${isConfiguring ? 'from-primary/70 to-purple-500/70' : 'from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600'}`}
                  >
                    {isConfiguring ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Configuration...
                      </>
                    ) : (
                      "Configurer"
                    )}
                  </Button>
                )}
              </div>
              {customDomain && !isDomainConfigured && (
                <div className="bg-muted/50 p-4 rounded-lg border border-primary/10">
                  <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Instructions DNS</h4>
                      <p className="text-sm text-muted-foreground">
                        Après avoir configuré votre domaine, vous devrez ajouter un enregistrement CNAME pointant vers{' '}
                        <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary">chat.spb.dev</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-card to-muted/30 p-5 rounded-xl border border-primary/10 relative overflow-hidden">
              <div className="absolute -right-2 -top-2 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base font-medium">Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${isDomainConfigured ? 'bg-green-500 animate-pulse' : 'bg-primary/30'}`}></div>
                    <p className="text-sm font-medium">
                      {isDomainConfigured 
                        ? <span className="text-green-500">Domaine configuré</span>
                        : customDomain 
                          ? "Configuration en attente" 
                          : "Aucun domaine configuré"}
                    </p>
                  </div>
                  {isDomainConfigured && (
                    <div className="pt-2">
                      <div className="text-xs border-t border-primary/10 pt-2">
                        Accessible à l'adresse:
                        <a 
                          href={`https://${customDomain}/chatbot/${chatbotId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary block mt-1 hover:underline font-medium"
                        >
                          {`https://${customDomain}/chatbot/${chatbotId}`}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-primary/10 shadow-xl transition-all hover:shadow-primary/5">
        <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent blur-2xl"></div>
        <CardHeader className="pb-4 relative">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Code className="h-5 w-5 text-primary" />
            </div>
            Méthodes d'intégration
          </CardTitle>
          <CardDescription className="text-base">
            Plusieurs façons d'intégrer votre chatbot IA dans votre site web
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
              <TabsTrigger 
                value="script" 
                className={`flex items-center gap-2 transition-all ${activeTab === "script" ? "bg-gradient-to-r from-primary/90 to-purple-500/90 text-white" : "hover:bg-muted/80"}`}
              >
                <Code className="h-4 w-4" />
                <span>Script</span>
              </TabsTrigger>
              <TabsTrigger 
                value="iframe" 
                className={`flex items-center gap-2 transition-all ${activeTab === "iframe" ? "bg-gradient-to-r from-primary/90 to-purple-500/90 text-white" : "hover:bg-muted/80"}`}
              >
                <Globe className="h-4 w-4" />
                <span>iFrame</span>
              </TabsTrigger>
              <TabsTrigger 
                value="api" 
                className={`flex items-center gap-2 transition-all ${activeTab === "api" ? "bg-gradient-to-r from-primary/90 to-purple-500/90 text-white" : "hover:bg-muted/80"}`}
              >
                <LinkIcon className="h-4 w-4" />
                <span>API</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="script" className="space-y-4 pt-6 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Intégration par script</h3>
                <p className="text-muted-foreground">
                  Ajoutez ce code juste avant la balise de fermeture <code>&lt;/body&gt;</code> pour créer un bouton de chat flottant.
                </p>
              </div>
              
              <div className="relative mt-4 group">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-purple-500 opacity-30 blur-sm group-hover:opacity-50 transition-all"></div>
                <div className="relative">
                  <Textarea
                    readOnly
                    value={isDomainConfigured && customDomain 
                      ? `<script src="https://${customDomain}/api/chatbot.js?id=${chatbotId}"></script>`
                      : scriptCode
                    }
                    className="min-h-20 font-mono text-sm bg-muted/50 border-primary/10 resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => copyToClipboard(isDomainConfigured && customDomain 
                      ? `<script src="https://${customDomain}/api/chatbot.js?id=${chatbotId}"></script>`
                      : scriptCode
                    )}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 border border-primary/10 mt-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Avantages</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span>Installation facile en une seule ligne</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span>Interface utilisateur prête à l'emploi</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span>Responsive et adapté aux mobiles</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="iframe" className="space-y-4 pt-6 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Intégration par iFrame</h3>
                <p className="text-muted-foreground">
                  Intégrez le chatbot dans une section spécifique de votre site avec des dimensions personnalisables.
                </p>
              </div>
              
              <div className="relative mt-4 group">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-purple-500 opacity-30 blur-sm group-hover:opacity-50 transition-all"></div>
                <div className="relative">
                  <Textarea
                    readOnly
                    value={isDomainConfigured && customDomain 
                      ? `<iframe
  src="https://${customDomain}/chatbot/embed/${chatbotId}"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>`
                      : iframeCode
                    }
                    className="min-h-32 font-mono text-sm bg-muted/50 border-primary/10 resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => copyToClipboard(isDomainConfigured && customDomain 
                      ? `<iframe
  src="https://${customDomain}/chatbot/embed/${chatbotId}"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>`
                      : iframeCode
                    )}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 border border-primary/10 mt-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Avantages</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span>Placement flexible dans votre mise en page</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span>Dimensionnement personnalisable</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <span>Isolation du contexte pour plus de sécurité</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4 pt-6 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Intégration par API</h3>
                <p className="text-muted-foreground">
                  Pour une intégration sur mesure, utilisez notre API RESTful pour construire votre propre interface.
                </p>
              </div>
              
              <div className="relative mt-4 group">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-purple-500 opacity-30 blur-sm group-hover:opacity-50 transition-all"></div>
                <div className="relative">
                  <Textarea
                    readOnly
                    value={isDomainConfigured && customDomain 
                      ? `// Using fetch API
fetch('https://${customDomain}/api/chatbot/${chatbotId}/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "Your question here",
    sessionId: "unique-session-id"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`
                      : apiCode
                    }
                    className="min-h-[240px] font-mono text-sm bg-muted/50 border-primary/10 resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-primary hover:bg-primary/10 transition-colors"
                    onClick={() => copyToClipboard(isDomainConfigured && customDomain 
                      ? `// Using fetch API
fetch('https://${customDomain}/api/chatbot/${chatbotId}/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "Your question here",
    sessionId: "unique-session-id"
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`
                      : apiCode
                    )}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-card to-muted/30 p-5 rounded-xl border border-primary/10 mt-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl"></div>
                <div className="relative">
                  <h4 className="text-base font-medium mb-2 flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    Documentation de l'API
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Consultez notre documentation complète pour intégrer votre chatbot avec n'importe quel langage ou framework.
                  </p>
                  <Button asChild className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 transition-all">
                    <a 
                      href={isDomainConfigured && customDomain 
                        ? `https://${customDomain}/docs/api` 
                        : "https://docs.chat.spb.dev/api"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1.5"
                    >
                      Voir la documentation <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 