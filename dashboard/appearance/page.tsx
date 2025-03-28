"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";
import { UploadButton } from "@/components/ui/upload-button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Settings, CheckCircle, Paintbrush, MessageSquareText, Palette, Image as ImageIcon, CornerDownRight, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AppearancePage() {
  const [activeTab, setActiveTab] = useState("general");
  const [previewMessage, setPreviewMessage] = useState("Bonjour ! Comment puis-je vous aider aujourd'hui ?");
  const [savedChanges, setSavedChanges] = useState(false);
  
  const [settings, setSettings] = useState({
    general: {
      name: "Mon Assistant IA",
      welcomeMessage: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      logo: "/default-logo.png",
      placeholder: "Posez votre question...",
      suggestedQuestions: [
        "Qu'est-ce que vous proposez ?",
        "Comment puis-je vous contacter ?",
        "Quels sont vos tarifs ?"
      ]
    },
    appearance: {
      primaryColor: "#7c3aed",
      secondaryColor: "#e5e7eb",
      textColor: "#1f2937",
      fontFamily: "Inter",
      fontSize: 16,
      borderRadius: 8,
      bubbleStyle: "rounded",
      userBubbleColor: "#7c3aed",
      botBubbleColor: "#f3f4f6",
      userTextColor: "#ffffff",
      botTextColor: "#1f2937",
      userIconUrl: "",
      botIconUrl: ""
    },
    behavior: {
      showTypingIndicator: true,
      autoOpenOnPageLoad: false,
      displaySources: true,
      suggestionsAfterResponse: true,
      delayBetweenMessages: 300,
      position: "bottom-right",
      height: 500
    }
  });
  
  // Handle settings changes
  const updateSettings = (category, field, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
    setSavedChanges(false);
  };
  
  const handleSuggestionChange = (index, value) => {
    const newSuggestions = [...settings.general.suggestedQuestions];
    newSuggestions[index] = value;
    
    updateSettings('general', 'suggestedQuestions', newSuggestions);
  };
  
  const addSuggestion = () => {
    updateSettings('general', 'suggestedQuestions', [
      ...settings.general.suggestedQuestions,
      "Nouvelle suggestion"
    ]);
  };
  
  const removeSuggestion = (index) => {
    const newSuggestions = [...settings.general.suggestedQuestions];
    newSuggestions.splice(index, 1);
    
    updateSettings('general', 'suggestedQuestions', newSuggestions);
  };
  
  const saveChanges = () => {
    // API call to save settings would go here
    setTimeout(() => {
      setSavedChanges(true);
      toast.success("Paramètres sauvegardés avec succès");
    }, 500);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personnalisation</h1>
          <p className="text-muted-foreground">Personnalisez l'apparence et le comportement de votre chatbot</p>
        </div>
        <Button onClick={saveChanges} disabled={savedChanges}>
          {savedChanges ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> Sauvegardé
            </>
          ) : "Sauvegarder les changements"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Général</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                <span>Apparence</span>
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" />
                <span>Comportement</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Personnalisez les informations de base de votre chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chatbotName">Nom du chatbot</Label>
                    <Input 
                      id="chatbotName" 
                      value={settings.general.name}
                      onChange={(e) => updateSettings('general', 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Message de bienvenue</Label>
                    <Textarea 
                      id="welcomeMessage" 
                      rows={3}
                      value={settings.general.welcomeMessage}
                      onChange={(e) => {
                        updateSettings('general', 'welcomeMessage', e.target.value);
                        setPreviewMessage(e.target.value);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="placeholder">Texte du placeholder</Label>
                    <Input 
                      id="placeholder" 
                      value={settings.general.placeholder}
                      onChange={(e) => updateSettings('general', 'placeholder', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Logo du chatbot</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <UploadButton text="Télécharger un logo" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Questions suggérées</CardTitle>
                  <CardDescription>
                    Ajoutez des suggestions de questions pour guider vos utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.general.suggestedQuestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={suggestion}
                        onChange={(e) => handleSuggestionChange(index, e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeSuggestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addSuggestion}
                    className="w-full flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" /> Ajouter une suggestion
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thème de couleurs</CardTitle>
                  <CardDescription>
                    Personnalisez les couleurs de votre chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Couleur principale</Label>
                      <ColorPicker 
                        color={settings.appearance.primaryColor}
                        onChange={(color) => updateSettings('appearance', 'primaryColor', color)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bulle utilisateur</Label>
                      <ColorPicker 
                        color={settings.appearance.userBubbleColor}
                        onChange={(color) => updateSettings('appearance', 'userBubbleColor', color)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bulle assistant</Label>
                      <ColorPicker 
                        color={settings.appearance.botBubbleColor}
                        onChange={(color) => updateSettings('appearance', 'botBubbleColor', color)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Texte utilisateur</Label>
                      <ColorPicker 
                        color={settings.appearance.userTextColor}
                        onChange={(color) => updateSettings('appearance', 'userTextColor', color)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Texte assistant</Label>
                      <ColorPicker 
                        color={settings.appearance.botTextColor}
                        onChange={(color) => updateSettings('appearance', 'botTextColor', color)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Style visuel</CardTitle>
                  <CardDescription>
                    Personnalisez l'aspect visuel de votre chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Police d'écriture</Label>
                      <Select 
                        value={settings.appearance.fontFamily}
                        onValueChange={(value) => updateSettings('appearance', 'fontFamily', value)}
                      >
                        <SelectTrigger id="fontFamily">
                          <SelectValue placeholder="Sélectionner une police" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bubbleStyle">Style des bulles</Label>
                      <Select 
                        value={settings.appearance.bubbleStyle}
                        onValueChange={(value) => updateSettings('appearance', 'bubbleStyle', value)}
                      >
                        <SelectTrigger id="bubbleStyle">
                          <SelectValue placeholder="Sélectionner un style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rounded">Arrondi</SelectItem>
                          <SelectItem value="square">Carré</SelectItem>
                          <SelectItem value="pill">Pilule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Taille de police</Label>
                      <div className="flex gap-4 items-center">
                        <span className="text-sm">12px</span>
                        <Slider 
                          value={[settings.appearance.fontSize]} 
                          min={12} 
                          max={20} 
                          step={1}
                          onValueChange={(value) => updateSettings('appearance', 'fontSize', value[0])}
                        />
                        <span className="text-sm">20px</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Coins arrondis</Label>
                      <div className="flex gap-4 items-center">
                        <span className="text-sm">0px</span>
                        <Slider 
                          value={[settings.appearance.borderRadius]} 
                          min={0} 
                          max={20} 
                          step={1}
                          onValueChange={(value) => updateSettings('appearance', 'borderRadius', value[0])}
                        />
                        <span className="text-sm">20px</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Icônes des participants</CardTitle>
                  <CardDescription>
                    Personnalisez les avatars de l'utilisateur et du chatbot
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Icône du chatbot</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <UploadButton text="Télécharger une icône" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Icône de l'utilisateur</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <UploadButton text="Télécharger une icône" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="behavior" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comportement du chatbot</CardTitle>
                  <CardDescription>
                    Configurez comment votre chatbot interagit avec les utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="typingIndicator">Indicateur de frappe</Label>
                      <p className="text-sm text-muted-foreground">
                        Afficher l'animation "en train d'écrire" pendant que le chatbot répond
                      </p>
                    </div>
                    <Switch
                      id="typingIndicator"
                      checked={settings.behavior.showTypingIndicator}
                      onCheckedChange={(checked) => updateSettings('behavior', 'showTypingIndicator', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoOpen">Ouverture automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Ouvrir automatiquement le chatbot quand un utilisateur visite votre site
                      </p>
                    </div>
                    <Switch
                      id="autoOpen"
                      checked={settings.behavior.autoOpenOnPageLoad}
                      onCheckedChange={(checked) => updateSettings('behavior', 'autoOpenOnPageLoad', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="displaySources">Afficher les sources</Label>
                      <p className="text-sm text-muted-foreground">
                        Montrer les sources d'information utilisées dans les réponses
                      </p>
                    </div>
                    <Switch
                      id="displaySources"
                      checked={settings.behavior.displaySources}
                      onCheckedChange={(checked) => updateSettings('behavior', 'displaySources', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="suggestions">Suggestions après réponse</Label>
                      <p className="text-sm text-muted-foreground">
                        Afficher des questions suggérées après chaque réponse du chatbot
                      </p>
                    </div>
                    <Switch
                      id="suggestions"
                      checked={settings.behavior.suggestionsAfterResponse}
                      onCheckedChange={(checked) => updateSettings('behavior', 'suggestionsAfterResponse', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Délai entre les messages (ms)</Label>
                    <div className="flex gap-4 items-center">
                      <span className="text-sm">0</span>
                      <Slider 
                        value={[settings.behavior.delayBetweenMessages]} 
                        min={0} 
                        max={1000} 
                        step={50}
                        onValueChange={(value) => updateSettings('behavior', 'delayBetweenMessages', value[0])}
                      />
                      <span className="text-sm">1000</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position du chatbot</Label>
                    <Select 
                      value={settings.behavior.position}
                      onValueChange={(value) => updateSettings('behavior', 'position', value)}
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Sélectionner une position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bas droite</SelectItem>
                        <SelectItem value="bottom-left">Bas gauche</SelectItem>
                        <SelectItem value="top-right">Haut droite</SelectItem>
                        <SelectItem value="top-left">Haut gauche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Hauteur du chatbot (px)</Label>
                    <div className="flex gap-4 items-center">
                      <span className="text-sm">300</span>
                      <Slider 
                        value={[settings.behavior.height]} 
                        min={300} 
                        max={800} 
                        step={10}
                        onValueChange={(value) => updateSettings('behavior', 'height', value[0])}
                      />
                      <span className="text-sm">800</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
              <CardDescription>
                Voici à quoi ressemblera votre chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg overflow-hidden"
                style={{
                  fontFamily: settings.appearance.fontFamily,
                  fontSize: `${settings.appearance.fontSize}px`,
                  "--border-radius": `${settings.appearance.borderRadius}px`,
                  "--primary-color": settings.appearance.primaryColor,
                  "--user-bubble-color": settings.appearance.userBubbleColor,
                  "--bot-bubble-color": settings.appearance.botBubbleColor,
                  "--user-text-color": settings.appearance.userTextColor,
                  "--bot-text-color": settings.appearance.botTextColor
                } as React.CSSProperties}
              >
                <div className="h-12 bg-primary/10 border-b flex items-center px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{settings.general.name}</span>
                  </div>
                </div>
                
                <div className="p-4 h-[400px] overflow-y-auto flex flex-col space-y-3 bg-gray-50/50">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center shrink-0 mt-1">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div 
                      className="p-3 shadow-sm"
                      style={{
                        backgroundColor: settings.appearance.botBubbleColor,
                        color: settings.appearance.botTextColor,
                        borderRadius: settings.appearance.bubbleStyle === 'rounded' 
                          ? `0 var(--border-radius) var(--border-radius) var(--border-radius)` 
                          : settings.appearance.bubbleStyle === 'square' 
                            ? '0px' 
                            : '0 18px 18px 18px'
                      }}
                    >
                      {previewMessage}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 max-w-[80%] self-end">
                    <div 
                      className="p-3 shadow-sm"
                      style={{
                        backgroundColor: settings.appearance.userBubbleColor,
                        color: settings.appearance.userTextColor,
                        borderRadius: settings.appearance.bubbleStyle === 'rounded' 
                          ? `var(--border-radius) 0 var(--border-radius) var(--border-radius)` 
                          : settings.appearance.bubbleStyle === 'square' 
                            ? '0px' 
                            : '18px 0 18px 18px'
                      }}
                    >
                      Je voudrais en savoir plus sur vos services.
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center shrink-0 mt-1">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {settings.behavior.suggestionsAfterResponse && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {settings.general.suggestedQuestions.slice(0, 2).map((question, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 py-1 px-3 text-sm rounded-full border bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <CornerDownRight className="h-3 w-3" /> {question}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="h-14 border-t flex items-center px-3 gap-2 bg-white">
                  <Input 
                    placeholder={settings.general.placeholder}
                    className="flex-1 focus-visible:ring-primary"
                  />
                  <Button size="sm" style={{ backgroundColor: settings.appearance.primaryColor }}>
                    Envoyer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 