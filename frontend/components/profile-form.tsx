"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Edit3, Save, X, LogOut, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateName, updatePassword } from "@/lib/profile-api"
import type { ProfileResponse } from "@/lib/profile-api"

interface ProfileFormProps {
  profile: ProfileResponse
  onProfileUpdate: (profile: ProfileResponse) => void
  onLogout: () => void
}

export default function ProfileForm({ profile, onProfileUpdate, onLogout }: ProfileFormProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [newName, setNewName] = useState(profile.name)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const updatedProfile = await updateName({
        user_id: profile.user_id,
        new_name: newName.trim(),
      })
      onProfileUpdate(updatedProfile)
      setIsEditingName(false)
      toast({
        title: "Name Updated",
        description: "Your name has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update name",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await updatePassword({
        user_id: profile.user_id,
        old_password: oldPassword,
        new_password: newPassword,
      })
      setIsEditingPassword(false)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelNameEdit = () => {
    setNewName(profile.name)
    setIsEditingName(false)
  }

  const handleCancelPasswordEdit = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setIsEditingPassword(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">User ID</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-gray-800 font-mono">{profile.user_id}</span>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Name</Label>
            {isEditingName ? (
              <div className="space-y-3">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name"
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateName}
                    disabled={isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={handleCancelNameEdit} disabled={isLoading} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-800">{profile.name}</span>
                </div>
                <Button
                  onClick={() => setIsEditingName(true)}
                  variant="ghost"
                  size="sm"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Email</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-800">{profile.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings Card */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Password</Label>
            {isEditingPassword ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Current Password</Label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Update Password
                  </Button>
                  <Button onClick={handleCancelPasswordEdit} disabled={isLoading} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-800">••••••••</span>
                </div>
                <Button
                  onClick={() => setIsEditingPassword(true)}
                  variant="ghost"
                  size="sm"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-red-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Sign Out</h3>
              <p className="text-sm text-gray-600">Sign out from your account</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
