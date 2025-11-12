package com.poc.crud.modules.music

import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicDTORequest
import com.poc.crud.modules.music.dto.PostMusicDTOResponse
import com.poc.crud.modules.music.service.MusicService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/musics")
class MusicController(
    private val musicService: MusicService
) {

    @GetMapping("")
    fun getAll(@RequestParam(required = false) groupId: Long?): ResponseEntity<Set<MusicDTO>> =
        ResponseEntity(musicService.getAllMusic(groupId), HttpStatus.CREATED)

    @GetMapping("/{id}/url")
    fun getMusicUrl(@PathVariable id: Long): ResponseEntity<String> = ResponseEntity.ok(musicService.getMusicUrl(id))

    @PostMapping("", consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun post(
        @RequestBody music: PostMusicDTORequest,
    ): PostMusicDTOResponse? = musicService.insertMusic(
        music
    )

    @PostMapping("/confirm/{id}")
    fun confirmMusic(@PathVariable id: Long): ResponseEntity<String> {
        musicService.confirmMusicUpload(id)
        return ResponseEntity.ok("Music upload confirmed.")
    }
}