'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Phone, MapPin, Edit2 } from 'lucide-react'
import { useState } from 'react'
import { useAuthContext } from '@/lib/auth-context'

export default function ProfilePage() {
  const { user } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Mwangi',
    email: user?.email || '',
    phone: '+254712345678',
    location: 'Nairobi, Kenya',
    bio: 'Professional service provider with 5 years of experience',
  })

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-lg gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Picture */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-bold text-primary">{profile.firstName[0]}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{profile.firstName} {profile.lastName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            {isEditing && (
              <Button variant="outline" size="sm" className="mt-2 rounded-lg">Upload Photo</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
              <Input 
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                disabled={!isEditing}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
              <Input 
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                disabled={!isEditing}
                className="rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <Input 
              value={profile.email}
              disabled
              className="rounded-lg bg-muted"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            <Input 
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              disabled={!isEditing}
              className="rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </label>
            <Input 
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              disabled={!isEditing}
              className="rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
            <textarea 
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              disabled={!isEditing}
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <Button className="rounded-lg">Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-lg">Cancel</Button>
          </div>
        )}
      </Card>

      {/* Account Security */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Account Security</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full h-12 rounded-lg justify-start">Change Password</Button>
          <Button variant="outline" className="w-full h-12 rounded-lg justify-start">Linked Accounts</Button>
          <Button variant="outline" className="w-full h-12 rounded-lg justify-start">Two-Factor Authentication</Button>
        </div>
      </Card>
    </div>
  )
}

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-lg gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Picture */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-bold text-primary">{profile.firstName[0]}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{profile.firstName} {profile.lastName}</h2>
            <p className="text-muted-foreground">{session?.user?.email}</p>
            {isEditing && (
              <Button variant="outline" size="sm" className="mt-2 rounded-lg">Upload Photo</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
              <Input 
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                disabled={!isEditing}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
              <Input 
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                disabled={!isEditing}
                className="rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <Input 
              value={profile.email}
              disabled
              className="rounded-lg bg-muted"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            <Input 
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              disabled={!isEditing}
              className="rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </label>
            <Input 
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              disabled={!isEditing}
              className="rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
            <textarea 
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              disabled={!isEditing}
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <Button className="rounded-lg">Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-lg">Cancel</Button>
          </div>
        )}
      </Card>

      {/* Account Security */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Account Security</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full h-12 rounded-lg justify-start">Change Password</Button>
          <Button variant="outline" className="w-full h-12 rounded-lg justify-start">Linked Accounts</Button>
          <Button variant="outline" className="w-full h-12 rounded-lg justify-start">Two-Factor Authentication</Button>
        </div>
      </Card>
    </div>
  )
}
